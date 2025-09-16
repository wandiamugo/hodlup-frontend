import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themesData from './assets/themes.json';
import HODLUPBoard from './HodlUpBoard';

const { width, height } = Dimensions.get('window');

// Game state initialization
const initializeGameState = () => ({
  timeChain: Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    bitcoinTokens: i === 0 ? 6 : Math.floor(Math.random() * 4) + 1,
    transactions: [],
    isGenesis: i === 0
  })),
  wallet: {
    bitcoinTokens: 1,
    miningRigs: 1,
    coldStorage: 0
  },
  difficulty: 21,
  currentBlock: 1,
  score: 0,
  blocksMinedSuccessfully: 0,
  privateHand: {
    player: [],
    bitcoin: [],
    hash: []
  },
  selectedCards: {
    player1: null,
    bitcoin: null,
    player2: null,
    hash: null
  }
});

// Generate sample cards
const generateSampleCards = () => {
  const playerColors = ['red', 'blue', 'green', 'purple', 'orange', 'yellow'];
  const cardId = () => 'card-' + Date.now() + '-' + Math.random();
  
  return {
    player: Array.from({ length: 6 }, (_, i) => ({
      id: cardId(),
      value: Math.floor(Math.random() * 6) + 1,
      color: playerColors[i % playerColors.length]
    })),
    bitcoin: Array.from({ length: 4 }, () => ({
      id: cardId(),
      value: Math.floor(Math.random() * 6) + 1,
      type: 'bitcoin'
    })),
    hash: Array.from({ length: 4 }, () => ({
      id: cardId(),
      value: Math.floor(Math.random() * 6) + 1,
      expression: 'SHA' + Math.floor(Math.random() * 999)
    }))
  };
};

// HODLUP Game Board Component
const HodlupGameBoard = ({
  hodlupState,
  onMineForBitcoin,
  onAddMiningRig,
  onMoveToColdStorage,
  onDrawCards,
  onCardSelect,
  onNewGame,
  theme
}) => {
  const styles = createHodlupStyles(theme);

  return (
    <ScrollView style={styles.gameBoard} contentContainerStyle={styles.gameBoardContent}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitleBig}>₿ HODLUP</Text>
        <Text style={styles.gameSubtitle}>Bitcoin Mining Game</Text>
        <View style={styles.gameStats}>
          <Text style={styles.difficultyDisplay}>Difficulty: {hodlupState.difficulty}</Text>
          <Text style={styles.blocksDisplay}>Blocks Mined: {hodlupState.blocksMinedSuccessfully}/17</Text>
        </View>
      </View>

      {/* Game Over Check */}
      {hodlupState.currentBlock > 17 && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>🎉 Game Complete!</Text>
          <Text style={styles.gameOverScore}>Final Score: {hodlupState.score}</Text>
          <Text style={styles.gameOverStats}>
            Successfully mined {hodlupState.blocksMinedSuccessfully} out of 17 blocks!
          </Text>
          <TouchableOpacity style={styles.newGameButton} onPress={onNewGame}>
            <Text style={styles.newGameButtonText}>🔄 New Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time-Chain Visualization */}
      <HODLUPBoard />
      {/* <View style={styles.timeChainContainer}>
        <Text style={styles.sectionTitle}>⛓️ Time-Chain (Block {hodlupState.currentBlock}/17)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeChainScroll}>
          {hodlupState.timeChain.map((block, index) => (
            <View 
              key={block.id} 
              style={[
                styles.timeChainBlock, 
                index === hodlupState.currentBlock - 1 && styles.currentBlock,
                block.isGenesis && styles.genesisBlock,
                block.transactions.length > 0 && styles.minedBlock
              ]}
            >
              <Text style={styles.blockNumber}>{block.id}</Text>
              <Text style={styles.blockTokens}>₿{block.bitcoinTokens}</Text>
              {block.transactions.length > 0 && (
                <View style={styles.transactionIndicator} />
              )}
            </View>
          ))}
        </ScrollView>
      </View> */}

      {/* Player Wallet */}
      <View style={styles.walletContainer}>
        <Text style={styles.sectionTitle}>💳 Your Wallet</Text>
        
        <View style={styles.walletStats}>
          <View style={styles.walletStat}>
            <Text style={styles.statLabel}>Hot Wallet:</Text>
            <Text style={styles.statValue}>₿{hodlupState.wallet.bitcoinTokens}</Text>
          </View>
          
          <View style={styles.walletStat}>
            <Text style={styles.statLabel}>Cold Storage:</Text>
            <Text style={styles.statValue}>₿{hodlupState.wallet.coldStorage}</Text>
          </View>
          
          <View style={styles.walletStat}>
            <Text style={styles.statLabel}>Mining Rigs:</Text>
            <Text style={styles.statValue}>⛏️ {hodlupState.wallet.miningRigs}</Text>
          </View>
        </View>

        {/* Wallet Actions */}
        <View style={styles.walletActions}>
          <TouchableOpacity 
            style={[styles.actionButton, hodlupState.wallet.bitcoinTokens < 1 && styles.disabledButton]}
            onPress={onAddMiningRig}
            disabled={hodlupState.wallet.bitcoinTokens < 1}
          >
            <Text style={styles.actionButtonText}>⛏️ Buy Mining Rig (₿1)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, hodlupState.wallet.bitcoinTokens < 1 && styles.disabledButton]}
            onPress={() => onMoveToColdStorage(1)}
            disabled={hodlupState.wallet.bitcoinTokens < 1}
          >
            <Text style={styles.actionButtonText}>🧊 Move to Cold Storage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player Hand */}
      {hodlupState.privateHand && hodlupState.currentBlock <= 17 && (
        <View style={styles.handContainer}>
          <Text style={styles.sectionTitle}>🃏 Your Cards</Text>
          
          <TouchableOpacity 
            style={styles.drawButton}
            onPress={onDrawCards}
          >
            <Text style={styles.drawButtonText}>📥 Draw Cards ({hodlupState.wallet.miningRigs} cards per turn)</Text>
          </TouchableOpacity>

          {/* Player Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeTitle}>👤 Player Cards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {hodlupState.privateHand.player?.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.card,
                      styles.playerCard,
                      hodlupState.selectedCards.player1?.id === card.id && styles.selectedCard,
                      hodlupState.selectedCards.player2?.id === card.id && styles.selectedCard
                    ]}
                    onPress={() => {
                      if (hodlupState.selectedCards.player1?.id === card.id) {
                        onCardSelect('player1', null);
                      } else if (hodlupState.selectedCards.player2?.id === card.id) {
                        onCardSelect('player2', null);
                      } else if (!hodlupState.selectedCards.player1) {
                        onCardSelect('player1', card);
                      } else if (!hodlupState.selectedCards.player2) {
                        onCardSelect('player2', card);
                      }
                    }}
                  >
                    <Text style={styles.cardValue}>{card.value}</Text>
                    <Text style={styles.cardColor}>{card.color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Bitcoin Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeTitle}>₿ Bitcoin Cards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {hodlupState.privateHand.bitcoin?.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.card,
                      styles.bitcoinCard,
                      hodlupState.selectedCards.bitcoin?.id === card.id && styles.selectedCard
                    ]}
                    onPress={() => onCardSelect('bitcoin', 
                      hodlupState.selectedCards.bitcoin?.id === card.id ? null : card
                    )}
                  >
                    <Text style={styles.cardValue}>{card.value}</Text>
                    <Text style={styles.cardType}>₿</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Hash Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeTitle}># Hash Cards</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {hodlupState.privateHand.hash?.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.card,
                      styles.hashCard,
                      hodlupState.selectedCards.hash?.id === card.id && styles.selectedCard
                    ]}
                    onPress={() => onCardSelect('hash', 
                      hodlupState.selectedCards.hash?.id === card.id ? null : card
                    )}
                  >
                    <Text style={styles.cardValue}>{card.value}</Text>
                    <Text style={styles.cardHash}>{card.expression}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Transaction Builder */}
      {hodlupState.currentBlock <= 17 && (
        <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>🔄 Create Transaction</Text>
          
          <View style={styles.transactionBuilder}>
            <View style={styles.transactionSlot}>
              <Text style={styles.slotLabel}>Sender</Text>
              {hodlupState.selectedCards.player1 ? (
                <View style={[styles.card, styles.playerCard, styles.selectedCard]}>
                  <Text style={styles.cardValue}>{hodlupState.selectedCards.player1.value}</Text>
                  <Text style={styles.cardColor}>{hodlupState.selectedCards.player1.color}</Text>
                </View>
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Select Player Card</Text>
                </View>
              )}
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.transactionSlot}>
              <Text style={styles.slotLabel}>Amount</Text>
              {hodlupState.selectedCards.bitcoin ? (
                <View style={[styles.card, styles.bitcoinCard, styles.selectedCard]}>
                  <Text style={styles.cardValue}>{hodlupState.selectedCards.bitcoin.value}</Text>
                  <Text style={styles.cardType}>₿</Text>
                </View>
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Select Bitcoin Card</Text>
                </View>
              )}
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.transactionSlot}>
              <Text style={styles.slotLabel}>Receiver</Text>
              {hodlupState.selectedCards.player2 ? (
                <View style={[styles.card, styles.playerCard, styles.selectedCard]}>
                  <Text style={styles.cardValue}>{hodlupState.selectedCards.player2.value}</Text>
                  <Text style={styles.cardColor}>{hodlupState.selectedCards.player2.color}</Text>
                </View>
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Select Player Card</Text>
                </View>
              )}
            </View>

            <Text style={styles.arrow}>+</Text>

            <View style={styles.transactionSlot}>
              <Text style={styles.slotLabel}>Hash</Text>
              {hodlupState.selectedCards.hash ? (
                <View style={[styles.card, styles.hashCard, styles.selectedCard]}>
                  <Text style={styles.cardValue}>{hodlupState.selectedCards.hash.value}</Text>
                  <Text style={styles.cardHash}>{hodlupState.selectedCards.hash.expression}</Text>
                </View>
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Select Hash Card</Text>
                </View>
              )}
            </View>
          </View>

          {/* Transaction Total */}
          {hodlupState.selectedCards.player1 && hodlupState.selectedCards.bitcoin && 
           hodlupState.selectedCards.player2 && hodlupState.selectedCards.hash && (
            <View style={styles.transactionTotal}>
              <Text style={styles.totalLabel}>Transaction Total:</Text>
              <Text style={styles.totalValue}>
                {hodlupState.selectedCards.player1.value + hodlupState.selectedCards.bitcoin.value + 
                 hodlupState.selectedCards.player2.value + hodlupState.selectedCards.hash.value}
              </Text>
              <Text style={styles.difficultyCheck}>
                {(hodlupState.selectedCards.player1.value + hodlupState.selectedCards.bitcoin.value + 
                  hodlupState.selectedCards.player2.value + hodlupState.selectedCards.hash.value) <= hodlupState.difficulty 
                  ? '✅ Valid (≤ ' + hodlupState.difficulty + ')' 
                  : '❌ Invalid (> ' + hodlupState.difficulty + ')'}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.mineButton,
              (!hodlupState.selectedCards.player1 || !hodlupState.selectedCards.bitcoin || 
               !hodlupState.selectedCards.player2 || !hodlupState.selectedCards.hash) && styles.disabledButton
            ]}
            onPress={onMineForBitcoin}
            disabled={!hodlupState.selectedCards.player1 || !hodlupState.selectedCards.bitcoin || 
                     !hodlupState.selectedCards.player2 || !hodlupState.selectedCards.hash}
          >
            <Text style={styles.mineButtonText}>⛏️ MINE FOR BITCOIN!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.sectionTitle}>📖 How to Play</Text>
        <Text style={styles.instructionText}>
          1. Draw cards using your mining rigs{'\n'}
          2. Select cards: 2 players, 1 bitcoin, 1 hash{'\n'}
          3. Transaction total must be ≤ difficulty ({hodlupState.difficulty}){'\n'}
          4. Mine successfully to earn Bitcoin and advance blocks{'\n'}
          5. Buy more mining rigs to draw more cards{'\n'}
          6. Complete all 17 blocks to win!
        </Text>
      </View>
    </ScrollView>
  );
};

// Main App Component
export default function HoldupCasino() {
  const [currentTheme, setCurrentTheme] = useState(themesData.themes.casino);
  const [appState, setAppState] = useState('menu');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [hodlupState, setHodlupState] = useState(initializeGameState());
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  // Game link/join state
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [showJoinGameModal, setShowJoinGameModal] = useState(false);
  const [joinKey, setJoinKey] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  useEffect(() => {
    if (appState === 'game' && hodlupState.privateHand.player.length === 0) {
      const sampleCards = generateSampleCards();
      setHodlupState(prev => ({
        ...prev,
        privateHand: sampleCards
      }));
    }
  }, [appState]);

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

  const switchTheme = async (themeId) => {
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

  const startNewGame = () => {
    setHodlupState(initializeGameState());
    const sampleCards = generateSampleCards();
    setHodlupState(prev => ({
      ...prev,
      privateHand: sampleCards
    }));
    setAppState('game');
  };

  const handleNewGame = () => {
    Alert.alert(
      '🔄 New Game',
      'Start a new HODLUP game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'New Game', onPress: startNewGame }
      ]
    );
  };

  const handleMineForBitcoin = () => {
    const { player1, bitcoin, player2, hash } = hodlupState.selectedCards;
    if (!player1 || !bitcoin || !player2 || !hash) {
      Alert.alert('⚠️ Invalid Transaction', 'Please select one card of each type: Player, Bitcoin, Player, Hash');
      return;
    }
    const transactionTotal = player1.value + bitcoin.value + player2.value + hash.value;
    if (transactionTotal > hodlupState.difficulty) {
      Alert.alert('❌ Mining Failed', `Transaction total (${transactionTotal}) exceeds difficulty (${hodlupState.difficulty})`);
      setHodlupState(prev => ({
        ...prev,
        difficulty: Math.min(30, prev.difficulty + 1),
        selectedCards: {
          player1: null,
          bitcoin: null,
          player2: null,
          hash: null
        }
      }));
      return;
    }
    setHodlupState(prev => {
      const newState = { ...prev };
      const currentBlockReward = newState.timeChain[newState.currentBlock - 1].bitcoinTokens;
      newState.wallet.bitcoinTokens += currentBlockReward;
      const efficiency = newState.difficulty - transactionTotal;
      const blockScore = currentBlockReward * 10 + efficiency * 5;
      newState.score += blockScore;
      newState.blocksMinedSuccessfully += 1;
      const transaction = { player1, bitcoin, player2, hash, total: transactionTotal };
      newState.timeChain[newState.currentBlock - 1].transactions.push(transaction);
      if (newState.currentBlock < 17) {
        newState.currentBlock += 1;
        if (efficiency > 5) {
          newState.difficulty = Math.max(10, newState.difficulty - 1);
        }
      }
      newState.selectedCards = {
        player1: null,
        bitcoin: null,
        player2: null,
        hash: null
      };
      newState.privateHand.player = newState.privateHand.player.filter(c => c.id !== player1.id && c.id !== player2.id);
      newState.privateHand.bitcoin = newState.privateHand.bitcoin.filter(c => c.id !== bitcoin.id);
      newState.privateHand.hash = newState.privateHand.hash.filter(c => c.id !== hash.id);
      return newState;
    });
    Alert.alert('⛏️ Mining Success!', `Successfully mined block ${hodlupState.currentBlock}!`);
  };

  const handleAddMiningRig = () => {
    if (hodlupState.wallet.bitcoinTokens < 1) {
      Alert.alert('❌ Insufficient Funds', 'You need at least 1 Bitcoin token to buy a mining rig');
      return;
    }
    setHodlupState(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        bitcoinTokens: prev.wallet.bitcoinTokens - 1,
        miningRigs: prev.wallet.miningRigs + 1
      }
    }));
    Alert.alert('⛏️ Mining Rig Purchased', 'You can now draw more cards per turn!');
  };

  const handleMoveToColdStorage = (amount) => {
    if (hodlupState.wallet.bitcoinTokens < amount) {
      Alert.alert('❌ Insufficient Funds', `You need at least ${amount} Bitcoin token(s) to move to cold storage`);
      return;
    }
    setHodlupState(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        bitcoinTokens: prev.wallet.bitcoinTokens - amount,
        coldStorage: prev.wallet.coldStorage + amount
      }
    }));
    Alert.alert('🧊 Cold Storage', `Moved ${amount} Bitcoin token(s) to cold storage for protection`);
  };

  const handleDrawCards = () => {
    const miningRigs = hodlupState.wallet.miningRigs;
    const newCards = generateSampleCards();
    setHodlupState(prev => ({
      ...prev,
      privateHand: {
        player: [...prev.privateHand.player, ...newCards.player.slice(0, Math.max(1, Math.floor(miningRigs * 0.5)))],
        bitcoin: [...prev.privateHand.bitcoin, ...newCards.bitcoin.slice(0, Math.max(1, Math.floor(miningRigs * 0.25)))],
        hash: [...prev.privateHand.hash, ...newCards.hash.slice(0, Math.max(1, Math.floor(miningRigs * 0.25)))]
      }
    }));
    Alert.alert('📥 Cards Drawn', `Drew new cards based on your ${miningRigs} mining rig(s)`);
  };

  const handleCardSelect = (cardType, card) => {
    setHodlupState(prev => ({
      ...prev,
      selectedCards: {
        ...prev.selectedCards,
        [cardType]: card
      }
    }));
  };

  // Game link/join logic
  const handleGenerateLink = () => {
    setGeneratedLink('https://hodlup-casino.app/game/' + Math.random().toString(36).slice(2, 10));
    setShowGenerateLinkModal(true);
  };

  const handleJoinGame = () => {
    if (joinKey.trim().length < 4) {
      Alert.alert('Invalid Key', 'Please enter a valid game key.');
      return;
    }
    Alert.alert('Joined Game', `Joined game with key: ${joinKey}`);
    setShowJoinGameModal(false);
    setJoinKey('');
    // setAppState('game'); // If you want to start the game
  };

  const styles = createStyles(currentTheme);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={{ uri: currentTheme.images.backgroundPattern }}
        style={styles.backgroundImage}
        blurRadius={2}
      >
        <Animated.View 
          style={[
            styles.overlay, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>₿ HODLUP</Text>
            <Text style={styles.subtitle}>Bitcoin Mining Game</Text>
            <Text style={styles.themeIndicator}>Theme: {currentTheme.name}</Text>
            
            <TouchableOpacity 
              style={styles.themeButton}
              onPress={() => setShowThemeModal(true)}
            >
              <Text style={styles.themeButtonText}>🎨 Themes</Text>
            </TouchableOpacity>
          </View>

          {appState === 'menu' && (
            <View style={styles.menuContainer}>
              <View style={styles.gameDescription}>
                <Text style={styles.descriptionTitle}>🎮 About HODLUP</Text>
                <Text style={styles.descriptionText}>
                  A Bitcoin mining card game where you create valid transactions to mine blocks and earn Bitcoin. 
                  Use strategy to manage your mining rigs, wallet, and cards to complete all 17 blocks!
                </Text>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={startNewGame}
                >
                  <Text style={styles.actionButtonText}>🎮 Start New Game</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleGenerateLink}
                >
                  <Text style={styles.actionButtonText}>🔗 Generate Game Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => setShowJoinGameModal(true)}
                >
                  <Text style={styles.actionButtonText}>🔑 Join Game</Text>
                </TouchableOpacity>

                {hodlupState.currentBlock > 1 && (
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

          {appState === 'game' && (
            <View style={styles.gameContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setAppState('menu')}
              >
                <Text style={styles.backButtonText}>← Menu</Text>
              </TouchableOpacity>

              <HodlupGameBoard
                hodlupState={hodlupState}
                onMineForBitcoin={handleMineForBitcoin}
                onAddMiningRig={handleAddMiningRig}
                onMoveToColdStorage={handleMoveToColdStorage}
                onDrawCards={handleDrawCards}
                onCardSelect={handleCardSelect}
                onNewGame={handleNewGame}
                theme={currentTheme}
              />
            </View>
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
                <ScrollView style={styles.themeScrollContainer}>
                  {Object.values(themesData.themes).map((theme) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeOption,
                        currentTheme.id === theme.id && styles.themeOptionActive
                      ]}
                      onPress={() => switchTheme(theme.id)}
                    >
                      <View style={styles.themePreview}>
                        <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.primary }]} />
                        <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.accent }]} />
                        <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.background }]} />
                      </View>
                      <View style={styles.themeInfo}>
                        <Text style={[
                          styles.themeName,
                          currentTheme.id === theme.id && styles.themeNameActive
                        ]}>
                          {theme.name}
                        </Text>
                        {currentTheme.id === theme.id && (
                          <Text style={styles.activeThemeIndicator}>✓ Active</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton, { marginTop: 16 }]}
                  onPress={() => setShowThemeModal(false)}
                >
                  <Text style={styles.modalPrimaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Generate Link Modal */}
          <Modal
            visible={showGenerateLinkModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGenerateLinkModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>🔗 Your Game Link</Text>
                <Text selectable style={styles.descriptionText}>{generatedLink}</Text>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton, { marginTop: 16 }]}
                  onPress={() => setShowGenerateLinkModal(false)}
                >
                  <Text style={styles.modalPrimaryButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Join Game Modal */}
          <Modal
            visible={showJoinGameModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowJoinGameModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>🔑 Join Game</Text>
                <TextInput
                  style={[styles.descriptionText, { backgroundColor: '#fff', color: '#000', marginBottom: 16, borderRadius: 8, padding: 8 }]}
                  placeholder="Enter game key..."
                  value={joinKey}
                  onChangeText={setJoinKey}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={handleJoinGame}
                >
                  <Text style={styles.modalPrimaryButtonText}>Join</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { marginTop: 8 }]}
                  onPress={() => setShowJoinGameModal(false)}
                >
                  <Text style={styles.modalPrimaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ...styles unchanged...
// Main App Styles
const createStyles = (theme) => StyleSheet.create({
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
    paddingBottom: theme.spacing.xl,
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
  themeIndicator: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: theme.spacing.small,
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
    ...theme.shadows.medium,
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
    ...theme.shadows.medium,
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
  backButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.medium,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
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
    ...theme.shadows.large,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xxlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalButton: {
    paddingVertical: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  modalPrimaryButton: {
    backgroundColor: theme.colors.primary,
  },
  modalPrimaryButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.semibold,
    fontSize: theme.fonts.sizes.medium,
  },
  themeScrollContainer: {
    maxHeight: 300,
    marginBottom: theme.spacing.medium,
  },
  themeOption: {
    flexDirection: 'row',
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
  themePreview: {
    flexDirection: 'row',
    marginRight: theme.spacing.medium,
  },
  themeColorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.medium,
  },
  themeNameActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold,
  },
  activeThemeIndicator: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.success,
    fontWeight: theme.fonts.weights.semibold,
    marginTop: theme.spacing.xs,
  },
});

// HODLUP Game Styles
const createHodlupStyles = (theme) => StyleSheet.create({
  gameBoard: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gameBoardContent: {
    padding: theme.spacing.medium,
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.large,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
  },
  gameTitleBig: {
    fontSize: theme.fonts.sizes.display,
    fontWeight: theme.fonts.weights.black,
    color: theme.colors.accent,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.medium,
    width: '100%',
  },
  difficultyDisplay: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
  },
  scoreDisplay: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
  },
  blocksDisplay: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.success,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
  },
  gameOverContainer: {
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  gameOverTitle: {
    fontSize: theme.fonts.sizes.xxlarge,
    fontWeight: theme.fonts.weights.black,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  gameOverScore: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  gameOverStats: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
  },
  newGameButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.medium,
  },
  newGameButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.medium,
  },
  timeChainContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  timeChainScroll: {
    flexDirection: 'row',
  },
  timeChainBlock: {
    width: 60,
    height: 80,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.small,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  currentBlock: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  genesisBlock: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent + '20',
  },
  minedBlock: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  blockNumber: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },
  blockTokens: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  transactionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  walletContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.medium,
  },
  walletStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  walletActions: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.text.muted,
    opacity: 0.5,
  },
  actionButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.medium,
    fontSize: theme.fonts.sizes.small,
  },
  handContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  drawButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  drawButtonText: {
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.medium,
    fontSize: theme.fonts.sizes.small,
  },
  cardTypeSection: {
    marginBottom: theme.spacing.large,
  },
  cardTypeTitle: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.small,
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  card: {
    width: 60,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  playerCard: {
    backgroundColor: theme.colors.primary + '30',
  },
  bitcoinCard: {
    backgroundColor: theme.colors.accent + '30',
  },
  hashCard: {
    backgroundColor: theme.colors.secondary + '30',
  },
  selectedCard: {
    borderColor: theme.colors.success,
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  cardValue: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },
  cardColor: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  cardType: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
  },
  cardHash: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  transactionContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  transactionBuilder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.large,
    flexWrap: 'wrap',
  },
  transactionSlot: {
    alignItems: 'center',
    minWidth: 70,
  },
  slotLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptySlot: {
    width: 60,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  arrow: {
    fontSize: theme.fonts.sizes.large,
    color: theme.colors.text.secondary,
    fontWeight: theme.fonts.weights.bold,
  },
  transactionTotal: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
  },
  totalLabel: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  totalValue: {
    fontSize: theme.fonts.sizes.xxlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  difficultyCheck: {
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.medium,
  },
  mineButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  mineButtonText: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
  },
  instructionText: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
});