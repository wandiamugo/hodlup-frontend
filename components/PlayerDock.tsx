import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { CardRenderer } from './UI/PlayerCard';

const { width } = Dimensions.get('window');

interface PlayerDockProps {
  player: {
    id: string;
    name: string;
    hand: Array<{
      id: string;
      type: 'player' | 'bitcoin' | 'hash';
      value: number;
      color?: string;
      expression?: string;
    }>;
    coinCount: {
      cold: number;
      hot: number;
    };
    minerTokens: number;
  };
  theme: any;
  onCardPress?: (cardId: string) => void;
}

export default function PlayerDock({ player, theme, onCardPress }: PlayerDockProps) {
  const styles = createStyles(theme);

  const getCardsByType = (type: string) => {
    return player.hand.filter(card => card.type === type);
  };

  const renderCard = (card: any) => {
    return (
      <TouchableOpacity
        key={card.id}
        style={styles.cardWrapper}
        onPress={() => onCardPress?.(card.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContainer}>
          <CardRenderer card={card} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Player Info Header */}
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>{player.name}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🧊 Cold</Text>
            <Text style={styles.statValue}>₿{player.coinCount.cold}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>🔥 Hot</Text>
            <Text style={styles.statValue}>₿{player.coinCount.hot}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>⛏️ Miners</Text>
            <Text style={styles.statValue}>{player.minerTokens}</Text>
          </View>
        </View>
      </View>

      {/* Hand Cards */}
      <View style={styles.handContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContent}
        >
          {/* Player Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeLabel}>👤 Players ({getCardsByType('player').length})</Text>
            <View style={styles.cardRow}>
              {getCardsByType('player').map(renderCard)}
            </View>
          </View>

          {/* Bitcoin Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeLabel}>₿ Bitcoin ({getCardsByType('bitcoin').length})</Text>
            <View style={styles.cardRow}>
              {getCardsByType('bitcoin').map(renderCard)}
            </View>
          </View>

          {/* Hash Cards */}
          <View style={styles.cardTypeSection}>
            <Text style={styles.cardTypeLabel}># Hash ({getCardsByType('hash').length})</Text>
            <View style={styles.cardRow}>
              {getCardsByType('hash').map(renderCard)}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
  },

  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.small,
  },

  playerName: {
    fontSize: theme.fonts.sizes.large,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },

  statValue: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.accent,
  },

  handContainer: {
    flex: 1,
  },

  cardsScrollContent: {
    paddingHorizontal: theme.spacing.small,
    gap: theme.spacing.large,
  },

  cardTypeSection: {
    alignItems: 'center',
  },

  cardTypeLabel: {
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },

  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },

  cardWrapper: {
    width: 50,
    height: 70,
  },

  cardContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
  },
});