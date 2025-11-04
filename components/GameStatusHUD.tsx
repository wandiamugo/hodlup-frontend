import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameStatusHUDProps {
  round: number;
  maxRounds: number;
  currentBlock: number;
  difficulty: number;
  currentPlayerName: string;
  availableMiningRigs: number;
  theme: any;
}

export default function GameStatusHUD({
  round,
  maxRounds,
  currentBlock,
  difficulty,
  currentPlayerName,
  availableMiningRigs,
  theme,
}: GameStatusHUDProps) {
  const styles = createStyles(theme);

  const getDifficultyColor = () => {
    if (difficulty >= 12) return theme.colors.success;
    if (difficulty >= 9) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Round Info */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Round</Text>
        <Text style={styles.statValue}>{round}/{maxRounds}</Text>
      </View>

      {/* Current Block */}
      <View style={[styles.statBox, styles.highlightBox]}>
        <Text style={styles.statLabel}>Block</Text>
        <Text style={[styles.statValue, styles.highlightValue]}>#{currentBlock}</Text>
      </View>

      {/* Difficulty */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Difficulty</Text>
        <Text style={[styles.statValue, { color: getDifficultyColor() }]}>≤{difficulty}</Text>
      </View>

      {/* Mining Rigs Available */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>⛏️ Rigs</Text>
        <Text style={styles.statValue}>{availableMiningRigs}/12</Text>
      </View>

      {/* Current Turn */}
      <View style={[styles.statBox, styles.turnBox]}>
        <Text style={styles.statLabel}>Current Turn</Text>
        <Text style={[styles.statValue, styles.turnPlayer]} numberOfLines={1}>
          {currentPlayerName}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    gap: theme.spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.small,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  highlightBox: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  turnBox: {
    flex: 1.5,
    backgroundColor: theme.colors.accent + '20',
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },

  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fonts.weights.medium,
  },

  statValue: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },

  highlightValue: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.large,
  },

  turnPlayer: {
    color: theme.colors.accent,
    fontSize: theme.fonts.sizes.small,
  },
});
