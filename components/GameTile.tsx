import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';

interface GameTileProps {
  tileNumber: number;
  tileData: {
    id: number;
    owner?: string;
    bitcoinTokens: number;
    transactions: any[];
    isGenesis?: boolean;
    isCurrentBlock?: boolean;
    isPreviousBlock?: boolean;
    isNextBlock?: boolean;
  };
  position: {
    left: string;
    top: string;
  };
  isSelected: boolean;
  onPress: (tileNumber: number) => void;
  theme: any;
  showDetails?: boolean;
}

export default function GameTile({
  tileNumber,
  tileData,
  position,
  isSelected,
  onPress,
  theme,
  showDetails = false
}: GameTileProps) {
  const styles = createStyles(theme);

  const getTileStyle = () => {
    let baseStyle = [styles.tile];

    if (tileData.isGenesis) {
      baseStyle.push(styles.genesisTile);
    } else if (tileData.isCurrentBlock) {
      baseStyle.push(styles.currentTile);
    } else if (tileData.isPreviousBlock) {
      baseStyle.push(styles.previousTile);
    } else if (tileData.isNextBlock) {
      baseStyle.push(styles.nextTile);
    }

    if (tileData.transactions.length > 0) {
      baseStyle.push(styles.minedTile);
    }

    if (tileData.owner) {
      baseStyle.push(styles.ownedTile);
    }

    if (isSelected) {
      baseStyle.push(styles.selectedTile);
    }

    return baseStyle;
  };

  const getStatusIcon = () => {
    if (tileData.isGenesis) return '🌟';
    if (tileData.isCurrentBlock) return '⏰';
    if (tileData.transactions.length > 0) return '⛏️';
    if (tileData.owner) return '🏠';
    return '🔲';
  };

  const getOwnershipIndicator = () => {
    if (!tileData.owner) return null;

    return (
      <View style={styles.ownershipIndicator}>
        <Text style={styles.ownerText}>
          {tileData.owner.substring(0, 2)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.tileContainer,
        {
          position: 'absolute',
          left: position.left,
          top: position.top,
        }
      ]}
      onPress={() => onPress(tileNumber)}
      activeOpacity={0.7}
    >
      <View style={getTileStyle()}>
        {/* Main tile content */}
        <Text style={styles.tileNumber}>{tileNumber}</Text>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>

        {/* Bitcoin tokens indicator */}
        <View style={styles.bitcoinIndicator}>
          <Text style={styles.bitcoinText}>₿{tileData.bitcoinTokens}</Text>
        </View>

        {/* Ownership indicator */}
        {getOwnershipIndicator()}

        {/* Transaction count */}
        {tileData.transactions.length > 0 && (
          <View style={styles.transactionIndicator}>
            <Text style={styles.transactionCount}>
              {tileData.transactions.length}
            </Text>
          </View>
        )}
      </View>

      {/* Expanded details when selected */}
      {isSelected && showDetails && (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsTitle}>Block {tileNumber}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tokens:</Text>
            <Text style={styles.detailValue}>₿{tileData.bitcoinTokens}</Text>
          </View>

          {tileData.owner && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Owner:</Text>
              <Text style={styles.detailValue}>{tileData.owner}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transactions:</Text>
            <Text style={styles.detailValue}>{tileData.transactions.length}</Text>
          </View>

          {tileData.isGenesis && (
            <Text style={styles.genesisLabel}>Genesis Block</Text>
          )}

          {tileData.isCurrentBlock && (
            <Text style={styles.currentLabel}>Current Block</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  tileContainer: {
    zIndex: 1,
  },

  tile: {
    width: 45,
    height: 52,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  genesisTile: {
    backgroundColor: theme.colors.accent + '40',
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },

  currentTile: {
    backgroundColor: theme.colors.primary + '40',
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },

  previousTile: {
    backgroundColor: theme.colors.secondary + '30',
    borderColor: theme.colors.secondary,
  },

  nextTile: {
    backgroundColor: theme.colors.text.muted + '20',
    borderColor: theme.colors.text.muted,
  },

  minedTile: {
    backgroundColor: theme.colors.success + '30',
    borderColor: theme.colors.success,
  },

  ownedTile: {
    backgroundColor: theme.colors.warning + '30',
    borderColor: theme.colors.warning,
  },

  selectedTile: {
    borderColor: '#FFD700',
    borderWidth: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    transform: [{ scale: 1.1 }],
  },

  tileNumber: {
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },

  statusIcon: {
    fontSize: 12,
    marginBottom: 2,
  },

  bitcoinIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
  },

  bitcoinText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.medium,
    textAlign: 'center',
  },

  ownershipIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ownerText: {
    fontSize: 8,
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.bold,
  },

  transactionIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  transactionCount: {
    fontSize: 8,
    color: theme.colors.text.primary,
    fontWeight: theme.fonts.weights.bold,
  },

  detailsPanel: {
    position: 'absolute',
    top: 60,
    left: -20,
    right: -20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.medium,
    zIndex: 1000,
    minWidth: 120,
  },

  detailsTitle: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },

  detailLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
  },

  detailValue: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
  },

  genesisLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  currentLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});