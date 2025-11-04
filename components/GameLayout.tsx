import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  SafeAreaView
} from 'react-native';
import PhysicalBoard from './PhysicalBoard';
import PlayerDock from './PlayerDock';
import OtherPlayersSection from './OtherPlayersSection';

const { width, height } = Dimensions.get('window');

interface GameLayoutProps {
  currentPlayer: {
    id: string;
    name: string;
    hand: any[];
    coinCount: {
      cold: number;
      hot: number;
    };
    minerTokens: number;
  };
  otherPlayers: Array<{
    id: string;
    name: string;
    cardCount: number;
    coinCount: {
      cold: number;
      hot: number;
    };
    minerTokens: number;
  }>;
  gameBoard: {
    blocks: Array<{
      id: number;
      owner?: string;
      bitcoinTokens: number;
      transactions: any[];
      isGenesis?: boolean;
    }>;
  };
  theme: any;
  onTilePress?: (tileNumber: number) => void;
  onPlayerPress?: (playerId: string) => void;
  currentBlock?: number;
}

export default function GameLayout({
  currentPlayer,
  otherPlayers,
  gameBoard,
  theme,
  onTilePress,
  onPlayerPress,
  currentBlock = 1
}: GameLayoutProps) {
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handleTilePress = (tileNumber: number) => {
    setSelectedTile(tileNumber);
    onTilePress?.(tileNumber);
  };

  const handlePlayerPress = (playerId: string) => {
    setSelectedPlayer(selectedPlayer === playerId ? null : playerId);
    onPlayerPress?.(playerId);
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section - Other Players */}
      <View style={styles.topSection}>
        <OtherPlayersSection
          players={otherPlayers}
          selectedPlayer={selectedPlayer}
          onPlayerPress={handlePlayerPress}
          theme={theme}
        />
      </View>

      {/* Middle Section - Game Board */}
      <View style={styles.middleSection}>
        <PhysicalBoard
          gameBoard={gameBoard}
          currentBlock={currentBlock}
          onTilePress={handleTilePress}
          theme={theme}
        />
      </View>

      {/* Bottom Section - Current Player Dock */}
      <View style={styles.bottomSection}>
        <PlayerDock
          player={currentPlayer}
          theme={theme}
        />
      </View>

    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Top Section (Other Players) - ~15% of screen
  topSection: {
    height: height * 0.15,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },

  // Middle Section (Game Board) - ~65% of screen
  middleSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Bottom Section (Current Player) - ~20% of screen
  bottomSection: {
    height: height * 0.2,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },

});