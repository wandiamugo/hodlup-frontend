import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';

export default function HoldupCasino() {
  const [appState, setAppState] = useState('menu');
  const [gameKey, setGameKey] = useState('');
  const [joinGameKey, setJoinGameKey] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const createGame = () => {
    setShowCreateModal(false);
    setAppState('lobby');
    setGameKey('ABC123');
    Alert.alert('Game Created', 'Your game has been created! (P2P backend will be added later)');
  };

  const joinGame = () => {
    if (!joinGameKey.trim()) {
      Alert.alert('Error', 'Please enter a game key');
      return;
    }
    
    setShowJoinModal(false);
    setAppState('lobby');
    Alert.alert('Joined Game', `Joined game: ${joinGameKey} (P2P backend will be added later)`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎰 HOLDUP</Text>
          <Text style={styles.subtitle}>P2P Casino</Text>
          <Text style={styles.note}>UI Demo - P2P Coming Soon</Text>
        </View>

        {appState === 'menu' && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={[styles.menuButton, styles.primaryButton]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.buttonText}>🎮 Create New Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.secondaryButton]}
              onPress={() => setShowJoinModal(true)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>🔗 Join Game</Text>
            </TouchableOpacity>

            <View style={styles.gameTypeContainer}>
              <Text style={styles.gameTypeTitle}>Choose Your Game:</Text>
              <View style={styles.gameTypes}>
                <View style={styles.gameTypeCard}>
                  <Text style={styles.gameTypeEmoji}>🃏</Text>
                  <Text style={styles.gameTypeName}>Poker</Text>
                </View>
                <View style={styles.gameTypeCard}>
                  <Text style={styles.gameTypeEmoji}>🎲</Text>
                  <Text style={styles.gameTypeName}>Blackjack</Text>
                </View>
                <View style={styles.gameTypeCard}>
                  <Text style={styles.gameTypeEmoji}>🎯</Text>
                  <Text style={styles.gameTypeName}>Roulette</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {appState === 'lobby' && (
          <View style={styles.lobbyContainer}>
            <Text style={styles.lobbyTitle}>🎪 Game Lobby</Text>
            <Text style={styles.gameKey}>Game Key: {gameKey}</Text>
            
            <View style={styles.playersSection}>
              <Text style={styles.playersTitle}>👥 Players (1/6)</Text>
              <View style={styles.playerCard}>
                <Text style={styles.playerName}>You</Text>
                <Text style={styles.playerChips}>💰 $1000</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setAppState('menu')}
            >
              <Text style={styles.backButtonText}>← Leave Game</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🎮 Create New Game</Text>
              
              <Text style={styles.modalNote}>
                This will create a P2P game room that others can join with a game key.
              </Text>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSecondaryButton]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={createGame}
                >
                  <Text style={styles.modalPrimaryButtonText}>Create Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showJoinModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🔗 Join Game</Text>
              
              <Text style={styles.modalNote}>
                Enter the game key shared by the host to join their game.
              </Text>
              
              <TextInput
                style={styles.textInput}
                value={joinGameKey}
                onChangeText={setJoinGameKey}
                placeholder="Enter game key (e.g., ABC123)..."
                placeholderTextColor="#888888"
                autoCapitalize="characters"
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSecondaryButton]}
                  onPress={() => {
                    setShowJoinModal(false);
                    setJoinGameKey('');
                  }}
                >
                  <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryButton]}
                  onPress={joinGame}
                >
                  <Text style={styles.modalPrimaryButtonText}>Join Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#FFD23F',
    textAlign: 'center',
    marginTop: 8,
  },
  note: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FF6B35',
  },
  gameTypeContainer: {
    marginTop: 40,
  },
  gameTypeTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  gameTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameTypeCard: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 80,
  },
  gameTypeEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  gameTypeName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  lobbyContainer: {
    flex: 1,
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 24,
  },
  lobbyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameKey: {
    fontSize: 18,
    color: '#FFD23F',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
    backgroundColor: '#1A1A2E',
    padding: 12,
    borderRadius: 8,
  },
  playersSection: {
    flex: 1,
  },
  playersTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  playerChips: {
    fontSize: 16,
    color: '#FFD23F',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalNote: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: '#16213E',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalPrimaryButton: {
    backgroundColor: '#FF6B35',
  },
  modalSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalSecondaryButtonText: {
    color: '#CCCCCC',
  },
  backButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
