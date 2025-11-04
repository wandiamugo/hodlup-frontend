import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

interface OtherPlayersSectionProps {
  players: Array<{
    id: string;
    name: string;
    cardCount: number;
    coinCount: {
      cold: number;
      hot: number;
    };
    minerTokens: number;
    isCurrentTurn?: boolean;
    securityStatus?: 'safe' | 'at_risk' | 'hacked';
  }>;
  selectedPlayer: string | null;
  onPlayerPress: (playerId: string) => void;
  theme: any;
}

export default function OtherPlayersSection({
  players,
  selectedPlayer,
  onPlayerPress,
  theme
}: OtherPlayersSectionProps) {
  const styles = createStyles(theme);

  const getPlayerStatusColor = (status?: string) => {
    switch (status) {
      case 'safe': return theme.colors.success;
      case 'at_risk': return theme.colors.warning || '#FFA500';
      case 'hacked': return theme.colors.error || '#FF0000';
      default: return theme.colors.text.secondary;
    }
  };

  const getPlayerStatusIcon = (status?: string) => {
    switch (status) {
      case 'safe': return '🛡️';
      case 'at_risk': return '⚠️';
      case 'hacked': return '🚨';
      default: return '🎮';
    }
  };

  const renderPlayer = (player: any) => {
    const isSelected = selectedPlayer === player.id;
    const isCurrentTurn = player.isCurrentTurn;
    const statusColor = getPlayerStatusColor(player.securityStatus);
    const statusIcon = getPlayerStatusIcon(player.securityStatus);

    return (
      <TouchableOpacity
        key={player.id}
        style={[
          styles.playerIcon,
          isCurrentTurn && styles.currentTurnPlayer,
          isSelected && styles.selectedPlayer
        ]}
        onPress={() => onPlayerPress(player.id)}
        activeOpacity={0.7}
      >
        {/* Player Avatar/Icon */}
        <View style={[styles.avatarContainer, { borderColor: statusColor }]}>
          <Text style={styles.avatarIcon}>{statusIcon}</Text>
          {isCurrentTurn && (
            <View style={styles.turnIndicator}>
              <Text style={styles.turnIndicatorText}>⏰</Text>
            </View>
          )}
        </View>

        {/* Player Name */}
        <Text style={styles.playerName} numberOfLines={1}>
          {player.name}
        </Text>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.quickStatText}>🃏{player.cardCount}</Text>
          <Text style={styles.quickStatText}>₿{player.coinCount.cold + player.coinCount.hot}</Text>
        </View>

        {/* Expanded Details (when selected) */}
        {isSelected && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🧊 Cold Storage:</Text>
              <Text style={styles.detailValue}>₿{player.coinCount.cold}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🔥 Hot Wallet:</Text>
              <Text style={styles.detailValue}>₿{player.coinCount.hot}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⛏️ Miners:</Text>
              <Text style={styles.detailValue}>{player.minerTokens}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🛡️ Security:</Text>
              <Text style={[styles.detailValue, { color: statusColor }]}>
                {player.securityStatus || 'unknown'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Other Players</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playersContainer}
      >
        {players.map(renderPlayer)}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: theme.spacing.small,
  },

  sectionTitle: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },

  playersContainer: {
    paddingHorizontal: theme.spacing.small,
    gap: theme.spacing.medium,
  },

  playerIcon: {
    alignItems: 'center',
    minWidth: 80,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  currentTurnPlayer: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  selectedPlayer: {
    backgroundColor: theme.colors.accent + '20',
    borderColor: theme.colors.accent,
    borderWidth: 2,
    minWidth: 150, // Expand when selected
  },

  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: theme.spacing.xs,
    position: 'relative',
  },

  avatarIcon: {
    fontSize: 18,
  },

  turnIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.warning || '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
  },

  turnIndicatorText: {
    fontSize: 8,
  },

  playerName: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },

  quickStats: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },

  quickStatText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
  },

  expandedDetails: {
    marginTop: theme.spacing.small,
    paddingTop: theme.spacing.small,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    width: '100%',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },

  detailLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    flex: 1,
  },

  detailValue: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
  },
});