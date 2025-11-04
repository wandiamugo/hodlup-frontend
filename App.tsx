import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themesData from './assets/themes.json';

// Game Engine
import {
  initializeGame,
  executePlayAction,
  getAvailableActions,
  isGameOver,
  calculateFinalScores,
  GameState,
  PlayOption,
  Card,
} from './game';
import { createReferenceDeck } from './game/setup';

// P2P Backend
import P2PManager from './peardrive/pearDriveManager';
import TurnManager from './peardrive/turnBasedManager';
import ChatManager from './peardrive/chatManager';

// UI Components
import GameLayout from './components/GameLayout';
import PlayOptionsMenu from './components/PlayOptionsMenu';
import GameStatusHUD from './components/GameStatusHUD';
import TransactionBuilder from './components/TransactionBuilder';
import WalletManager from './components/WalletManager';

const { width, height } = Dimensions.get('window');

export default function HoldupCasino() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState(themesData.themes.casino);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // App state
  const [appState, setAppState] = useState<'menu' | 'lobby' | 'game'>('menu');

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);

  // P2P state
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // UI state
  const [showTransactionBuilder, setShowTransactionBuilder] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);

  // P2P Managers (refs to persist across renders)
  const p2pManager = useRef<any>(null);
  const turnManager = useRef<any>(null);
  const chatManager = useRef<any>(null);

  useEffect(() => {
    loadSavedTheme();
    initializeP2P();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedTheme');
      if (savedThemeId && themesData.themes[savedThemeId]) {
        setCurrentTheme(themesData.themes[savedThemeId]);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  const initializeP2P = async () => {
    try {
      console.log('🚀 Initializing P2P managers...');

      // Initialize P2P Manager
      p2pManager.current = new P2PManager();
      await p2pManager.current.initialize();

      // Initialize Turn Manager
      turnManager.current = new TurnManager(p2pManager.current);

      // Initialize Chat Manager
      chatManager.current = new ChatManager(p2pManager.current, turnManager.current);
      chatManager.current.initialize(p2pManager.current.localPeerId);

      // Set up P2P event listeners
      setupP2PListeners();

      console.log('✅ P2P managers initialized');
    } catch (error) {
      console.error('❌ Failed to initialize P2P:', error);
    }
  };

  const setupP2PListeners = () => {
    if (!p2pManager.current || !turnManager.current || !chatManager.current) return;

    // P2P connection events
    p2pManager.current.on('peer_connected', (data: any) => {
      console.log('👥 Peer connected:', data.peerId);
      setConnectedPeers(p2pManager.current.getConnectedPeers());
    });

    p2pManager.current.on('peer_disconnected', (data: any) => {
      console.log('👋 Peer disconnected:', data.peerId);
      setConnectedPeers(p2pManager.current.getConnectedPeers());
    });

    // Chat events
    chatManager.current.on('message_received', (message: any) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Turn events
    turnManager.current.on('turn_started', (data: any) => {
      console.log('🎯 Turn started:', data.player.name);
    });

    turnManager.current.on('move_made', (data: any) => {
      console.log('🎮 Move made:', data.moveData);
      // Sync game state from P2P move
      syncGameStateFromP2P(data);
    });

    turnManager.current.on('game_started', (data: any) => {
      console.log('🎮 Multiplayer game started!');
      setAppState('game');
    });

    turnManager.current.on('game_ended', (data: any) => {
      console.log('🏁 Multiplayer game ended!');
      handleGameOver(gameState!);
    });
  };

  const switchTheme = async (themeId: string) => {
    try {
      if (themesData.themes[themeId]) {
        setCurrentTheme(themesData.themes[themeId]);
        await AsyncStorage.setItem('selectedTheme', themeId);
        setShowThemeModal(false);
      }
    } catch (error) {
      console.error('Error switching theme:', error);
    }
  };

  // ========== MULTIPLAYER FUNCTIONS ==========
  const createMultiplayerGame = async () => {
    try {
      if (!p2pManager.current) {
        Alert.alert('Error', 'P2P not initialized');
        return;
      }

      const code = await p2pManager.current.createGame();
      setGameCode(code);
      setIsHost(true);
      setIsMultiplayer(true);
      setAppState('lobby');

      await turnManager.current.initializeGame(true, code);

      // Add local player
      turnManager.current.addPlayer(p2pManager.current.localPeerId, {
        name: 'You',
        isHost: true,
      });

      Alert.alert('🎮 Game Created!', `Game Code: ${code}\n\nShare this code with other players!`);
    } catch (error: any) {
      console.error('Failed to create multiplayer game:', error);
      Alert.alert('Error', 'Failed to create multiplayer game');
    }
  };

  const joinMultiplayerGame = async (code: string) => {
    try {
      if (!p2pManager.current) {
        Alert.alert('Error', 'P2P not initialized');
        return;
      }

      await p2pManager.current.joinGame(code);
      setGameCode(code);
      setIsHost(false);
      setIsMultiplayer(true);
      setAppState('lobby');

      await turnManager.current.initializeGame(false, code);

      // Add local player
      turnManager.current.addPlayer(p2pManager.current.localPeerId, {
        name: 'You',
        isHost: false,
      });

      // Notify host
      p2pManager.current.broadcastMessage({
        type: 'player_joined',
        data: {
          peerId: p2pManager.current.localPeerId,
          playerData: { name: 'You', isHost: false },
        },
      });

      Alert.alert('✅ Joined Game!', `Connected to game: ${code}`);
    } catch (error: any) {
      console.error('Failed to join multiplayer game:', error);
      Alert.alert('Error', 'Failed to join multiplayer game');
    }
  };

  const syncGameStateFromP2P = (data: any) => {
    // When receiving moves from other players, update local game state
    if (!isMultiplayer || !gameState) return;

    try {
      // Execute the action locally to stay in sync
      const updatedState = executePlayAction(gameState, {
        type: data.moveData.action,
        playerId: data.peerId,
        data: data.moveData,
      });

      setGameState(updatedState);
    } catch (error) {
      console.error('Failed to sync game state from P2P:', error);
    }
  };

  const broadcastGameAction = (action: any) => {
    if (!isMultiplayer || !p2pManager.current) return;

    p2pManager.current.broadcastMessage({
      type: 'make_move',
      data: {
        peerId: p2pManager.current.localPeerId,
        move: action,
      },
    });
  };

  // ========== GAME FUNCTIONS ==========
  const startNewGame = () => {
    try {
      // Initialize game with player names
      const playerNames = ['You', 'Player 2', 'Player 3', 'Player 4'];
      const newGameState = initializeGame(playerNames);

      setGameState(newGameState);
      setIsMultiplayer(false);
      setAppState('game');

      Alert.alert(
        '🎮 Game Started!',
        `Welcome to HODL UP! You are starting at block ${newGameState.currentBlock}.`
      );
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const startMultiplayerGameFromLobby = () => {
    if (!isHost || !turnManager.current) {
      Alert.alert('Error', 'Only the host can start the game');
      return;
    }

    try {
      // Get player names from turn manager
      const players = Array.from(turnManager.current.gameState.players.values());
      const playerNames = players.map((p: any) => p.name);

      // Initialize game state
      const newGameState = initializeGame(playerNames);
      setGameState(newGameState);

      // Start multiplayer game
      turnManager.current.startGame();

      chatManager.current?.addSystemMessage('Multiplayer game started! Good luck!');
    } catch (error) {
      console.error('Error starting multiplayer game:', error);
      Alert.alert('Error', 'Failed to start multiplayer game');
    }
  };

  const handlePlayOption = async (option: PlayOption) => {
    if (!gameState) return;

    try {
      const currentPlayer = gameState.players.find((p) => p.isCurrentTurn);
      if (!currentPlayer) {
        Alert.alert('Error', 'No current player found');
        return;
      }

      switch (option) {
        case PlayOption.MINE:
          // Open transaction builder
          setShowTransactionBuilder(true);
          break;

        case PlayOption.BUY_MINING_RIG:
          const updatedStateRig = executePlayAction(gameState, {
            type: PlayOption.BUY_MINING_RIG,
            playerId: currentPlayer.id,
          });
          setGameState(updatedStateRig);

          // Broadcast to other players in multiplayer
          if (isMultiplayer) {
            broadcastGameAction({ action: PlayOption.BUY_MINING_RIG });
          }

          Alert.alert('⛏️ Mining Rig Purchased!', 'You can now draw more cards per turn.');
          break;

        case PlayOption.MOVE_TO_COLD_STORAGE:
          setShowWalletManager(true);
          break;

        case PlayOption.MOVE_TO_NEXT_BLOCK:
          const updatedStateNext = executePlayAction(gameState, {
            type: PlayOption.MOVE_TO_NEXT_BLOCK,
            playerId: currentPlayer.id,
          });
          setGameState(updatedStateNext);

          // Broadcast to other players in multiplayer
          if (isMultiplayer) {
            broadcastGameAction({ action: PlayOption.MOVE_TO_NEXT_BLOCK });
          }

          // Check if game is over
          if (isGameOver(updatedStateNext)) {
            handleGameOver(updatedStateNext);
          }
          break;

        default:
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to execute action');
    }
  };

  const handleTransactionCreate = (cards: Card[]) => {
    if (!gameState) return;

    try {
      const currentPlayer = gameState.players.find((p) => p.isCurrentTurn);
      if (!currentPlayer) return;

      const updatedState = executePlayAction(gameState, {
        type: PlayOption.MINE,
        playerId: currentPlayer.id,
        data: { transactionCards: cards },
      });

      setGameState(updatedState);
      setShowTransactionBuilder(false);

      // Broadcast to other players in multiplayer
      if (isMultiplayer) {
        broadcastGameAction({
          action: PlayOption.MINE,
          transactionCards: cards,
        });
      }

      Alert.alert('⛏️ Mining Success!', 'Transaction created and block mined!');

      // Check if game is over
      if (isGameOver(updatedState)) {
        handleGameOver(updatedState);
      }
    } catch (error: any) {
      Alert.alert('Mining Failed', error.message || 'Invalid transaction');
    }
  };

  const handleMoveToCold = (amount: number) => {
    if (!gameState) return;

    try {
      const currentPlayer = gameState.players.find((p) => p.isCurrentTurn);
      if (!currentPlayer) return;

      const updatedState = executePlayAction(gameState, {
        type: PlayOption.MOVE_TO_COLD_STORAGE,
        playerId: currentPlayer.id,
        data: { amount },
      });

      setGameState(updatedState);
      setShowWalletManager(false);

      // Broadcast to other players in multiplayer
      if (isMultiplayer) {
        broadcastGameAction({
          action: PlayOption.MOVE_TO_COLD_STORAGE,
          amount,
        });
      }

      Alert.alert('🧊 Success', `Moved ${amount} bitcoin to cold storage`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to move to cold storage');
    }
  };

  const handleMoveToHot = (amount: number) => {
    if (!gameState) return;

    try {
      const currentPlayer = gameState.players.find((p) => p.isCurrentTurn);
      if (!currentPlayer) return;

      const wallet = gameState.wallets.find((w) => w.color === currentPlayer.walletColor);
      if (!wallet) return;

      // Move from cold to hot (opposite of move to cold)
      if (wallet.coldStorage < amount) {
        Alert.alert('Error', 'Insufficient cold storage');
        return;
      }

      wallet.coldStorage -= amount;
      wallet.hotStorage += amount;

      setGameState({ ...gameState });
      setShowWalletManager(false);

      Alert.alert('🔥 Success', `Moved ${amount} bitcoin to hot storage`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to move to hot storage');
    }
  };

  const handleGameOver = (finalGameState: GameState) => {
    const scores = calculateFinalScores(finalGameState);
    const sortedScores = scores.sort((a, b) => b.score - a.score);

    const winner = finalGameState.players.find((p) => p.id === sortedScores[0].playerId);

    let message = '🏆 Final Scores:\n\n';
    sortedScores.forEach((scoreData, index) => {
      const player = finalGameState.players.find((p) => p.id === scoreData.playerId);
      message += `${index + 1}. ${player?.name}: ${scoreData.score} points\n`;
    });

    Alert.alert(
      '🎉 Game Over!',
      message,
      [
        { text: 'New Game', onPress: startNewGame },
        { text: 'Main Menu', onPress: () => setAppState('menu') },
      ]
    );
  };

  const getCurrentPlayer = () => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.isCurrentTurn);
  };

  const getCurrentWallet = () => {
    const player = getCurrentPlayer();
    if (!player || !gameState) return null;
    return gameState.wallets.find((w) => w.color === player.walletColor);
  };

  const styles = createStyles(currentTheme);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: currentTheme.images.backgroundPattern }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>₿ HODLUP</Text>
            <Text style={styles.subtitle}>Bitcoin Mining Game</Text>

            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => setShowThemeModal(true)}
            >
              <Text style={styles.themeButtonText}>🎨 Themes</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Screen */}
          {appState === 'menu' && (
            <View style={styles.menuContainer}>
              <View style={styles.gameDescription}>
                <Text style={styles.descriptionTitle}>🎮 About HODL UP</Text>
                <Text style={styles.descriptionText}>
                  A Bitcoin mining card game where you create valid transactions to mine blocks
                  and earn Bitcoin. Use strategy to manage your mining rigs, wallet, and cards!
                </Text>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={startNewGame}
                >
                  <Text style={styles.actionButtonText}>🎮 Solo Game</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.multiplayerButton]}
                  onPress={createMultiplayerGame}
                >
                  <Text style={styles.actionButtonText}>👥 Create Multiplayer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => {
                    Alert.prompt(
                      'Join Game',
                      'Enter game code:',
                      (code) => {
                        if (code && code.trim()) {
                          joinMultiplayerGame(code.trim().toUpperCase());
                        }
                      },
                      'plain-text',
                      '',
                      'default'
                    );
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    🚪 Join Game
                  </Text>
                </TouchableOpacity>

                {gameState && !isMultiplayer && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => setAppState('game')}
                  >
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                      📱 Continue Game
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Multiplayer Lobby Screen */}
          {appState === 'lobby' && (
            <View style={styles.lobbyContainer}>
              <View style={styles.lobbyHeader}>
                <Text style={styles.lobbyTitle}>🎮 Multiplayer Lobby</Text>
                <Text style={styles.gameCodeText}>Game Code: {gameCode}</Text>
                <Text style={styles.lobbySubtitle}>
                  {isHost ? 'Waiting for players to join...' : 'Waiting for host to start...'}
                </Text>
              </View>

              <View style={styles.playersListContainer}>
                <Text style={styles.playersListTitle}>Players ({connectedPeers.length + 1}/4)</Text>
                <View style={styles.playerItem}>
                  <Text style={styles.playerName}>You {isHost && '(Host)'}</Text>
                  <Text style={styles.playerStatus}>✅ Ready</Text>
                </View>
                {connectedPeers.map((peerId) => (
                  <View key={peerId} style={styles.playerItem}>
                    <Text style={styles.playerName}>Player {peerId.slice(-4)}</Text>
                    <Text style={styles.playerStatus}>✅ Ready</Text>
                  </View>
                ))}
              </View>

              <View style={styles.lobbyActions}>
                {isHost && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={startMultiplayerGameFromLobby}
                    disabled={connectedPeers.length < 1}
                  >
                    <Text style={styles.actionButtonText}>🚀 Start Game</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => {
                    setAppState('menu');
                    setIsMultiplayer(false);
                    setGameCode(null);
                    p2pManager.current?.disconnect();
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    ← Back to Menu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Game Screen */}
          {appState === 'game' && gameState && (
            <ScrollView
              style={styles.gameContainer}
              contentContainerStyle={styles.gameScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setAppState('menu')}
              >
                <Text style={styles.backButtonText}>← Menu</Text>
              </TouchableOpacity>

              {/* Game Status HUD */}
              <GameStatusHUD
                round={gameState.round}
                maxRounds={gameState.maxRounds}
                currentBlock={gameState.currentBlock}
                difficulty={gameState.difficulty}
                currentPlayerName={getCurrentPlayer()?.name || 'Unknown'}
                availableMiningRigs={gameState.availableMiningRigs}
                theme={currentTheme}
              />

              {/* Play Options Menu */}
              {getCurrentPlayer()?.id === gameState.currentTurnPlayerId && (
                <View style={styles.playOptionsContainer}>
                  <PlayOptionsMenu
                    availableOptions={getAvailableActions(gameState, gameState.currentTurnPlayerId)}
                    onOptionSelect={handlePlayOption}
                    theme={currentTheme}
                  />
                </View>
              )}

              {/* Game Layout */}
              <GameLayout
                currentPlayer={{
                  id: getCurrentPlayer()?.id || 'player_0',
                  name: getCurrentPlayer()?.name || 'You',
                  hand: getCurrentPlayer()?.hand || [],
                  coinCount: {
                    cold: getCurrentWallet()?.coldStorage || 0,
                    hot: getCurrentWallet()?.hotStorage || 0,
                  },
                  minerTokens: getCurrentWallet()?.miningRigs || 0,
                }}
                otherPlayers={gameState.players
                  .filter((p) => p.id !== getCurrentPlayer()?.id)
                  .map((p) => {
                    const wallet = gameState.wallets.find((w) => w.color === p.walletColor);
                    return {
                      id: p.id,
                      name: p.name,
                      cardCount: p.hand.length,
                      coinCount: {
                        cold: wallet?.coldStorage || 0,
                        hot: wallet?.hotStorage || 0,
                      },
                      minerTokens: wallet?.miningRigs || 0,
                      isCurrentTurn: p.isCurrentTurn,
                    };
                  })}
                gameBoard={{
                  blocks: gameState.blocks,
                }}
                theme={currentTheme}
                currentBlock={gameState.currentBlock}
                onTilePress={(tileNumber) => {
                  console.log('Tile pressed:', tileNumber);
                }}
                onPlayerPress={(playerId) => {
                  console.log('Player pressed:', playerId);
                }}
              />
            </ScrollView>
          )}

          {/* Theme Modal */}
          <Modal
            visible={showThemeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>🎨 Choose Theme</Text>
                {Object.values(themesData.themes).map((theme: any) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeOption,
                      currentTheme.id === theme.id && styles.themeOptionActive,
                    ]}
                    onPress={() => switchTheme(theme.id)}
                  >
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {currentTheme.id === theme.id && (
                      <Text style={styles.activeThemeIndicator}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={() => setShowThemeModal(false)}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Transaction Builder Modal */}
          {showTransactionBuilder && getCurrentPlayer() && (
            <Modal
              visible={showTransactionBuilder}
              animationType="slide"
              onRequestClose={() => setShowTransactionBuilder(false)}
            >
              <SafeAreaView style={styles.modalFullScreen}>
                <TransactionBuilder
                  playerHand={getCurrentPlayer()!.hand}
                  availableDeck={createReferenceDeck()}
                  onTransactionCreate={handleTransactionCreate}
                  onCancel={() => setShowTransactionBuilder(false)}
                  theme={currentTheme}
                />
              </SafeAreaView>
            </Modal>
          )}

          {/* Wallet Manager Modal */}
          {getCurrentWallet() && (
            <WalletManager
              visible={showWalletManager}
              hotStorage={getCurrentWallet()!.hotStorage}
              coldStorage={getCurrentWallet()!.coldStorage}
              miningRigs={getCurrentWallet()!.miningRigs}
              onMoveToCold={handleMoveToCold}
              onMoveToHot={handleMoveToHot}
              onClose={() => setShowWalletManager(false)}
              theme={currentTheme}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.large,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.large,
    paddingBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fonts.sizes.display,
    fontWeight: theme.fonts.weights.black,
    color: theme.colors.text.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.large,
    color: theme.colors.accent,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    fontWeight: theme.fonts.weights.medium,
  },
  themeButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.large,
    marginTop: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.medium,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gameDescription: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.xl,
  },
  descriptionTitle: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  descriptionText: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    gap: theme.spacing.medium,
  },
  actionButton: {
    paddingVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  gameContainer: {
    flex: 1,
  },
  gameScrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.small,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.medium,
  },
  playOptionsContainer: {
    marginBottom: theme.spacing.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xxlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardBackground,
  },
  themeName: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.medium,
  },
  activeThemeIndicator: {
    fontSize: theme.fonts.sizes.large,
    color: theme.colors.success,
    fontWeight: theme.fonts.weights.bold,
  },
  modalButton: {
    paddingVertical: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.medium,
  },
  modalPrimaryButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.semibold,
    fontSize: theme.fonts.sizes.medium,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  multiplayerButton: {
    backgroundColor: theme.colors.accent,
  },
  lobbyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  lobbyHeader: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.large,
    alignItems: 'center',
  },
  lobbyTitle: {
    fontSize: theme.fonts.sizes.xxlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.medium,
  },
  gameCodeText: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.small,
  },
  lobbySubtitle: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  playersListContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  playersListTitle: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.medium,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  playerName: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
  },
  playerStatus: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.success,
  },
  lobbyActions: {
    gap: theme.spacing.medium,
  },
});
