import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HexagonTileProps {
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
  size?: number;
}

export default function HexagonTile({
  tileNumber,
  tileData,
  position,
  isSelected,
  onPress,
  theme,
  showDetails = false,
  size = 50
}: HexagonTileProps) {
  const styles = createStyles(theme, size);

  const getHexagonColor = () => {
    if (isSelected) return '#FFD700';
    if (tileData.isGenesis) return '#FFC107';
    if (tileData.isCurrentBlock) return '#2196F3';
    if (tileData.transactions.length > 0) return '#4CAF50';
    if (tileData.owner) return '#FF9800';
    return '#424242';
  };

  const getBorderColor = () => {
    if (isSelected) return '#FFD700';
    if (tileData.isGenesis) return theme.colors.accent;
    if (tileData.isCurrentBlock) return theme.colors.primary;
    if (tileData.transactions.length > 0) return theme.colors.success;
    if (tileData.owner) return theme.colors.warning;
    return theme.colors.border;
  };

  const getStatusIcon = () => {
    if (tileData.isGenesis) return '🌟';
    if (tileData.isCurrentBlock) return '⏰';
    if (tileData.transactions.length > 0) return '⛏️';
    if (tileData.owner) return '🏠';
    return '';
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(tileNumber)}
        activeOpacity={0.7}
      >
        {/* Hexagon container */}
        <View style={styles.hexagonContainer}>
          {/* Top half of hexagon */}
          <View style={[
            styles.hexagonTop,
            {
              backgroundColor: getHexagonColor(),
              borderBottomColor: getBorderColor(),
              borderBottomWidth: isSelected ? 3 : 2,
            }
          ]} />

          {/* Middle rectangle */}
          <View style={[
            styles.hexagonMiddle,
            {
              backgroundColor: getHexagonColor(),
              borderLeftColor: getBorderColor(),
              borderRightColor: getBorderColor(),
              borderLeftWidth: isSelected ? 3 : 2,
              borderRightWidth: isSelected ? 3 : 2,
            }
          ]}>
            {/* Content inside hexagon */}
            <View style={styles.contentContainer}>
              <Text style={styles.tileNumber}>{tileNumber}</Text>

              {getStatusIcon() && (
                <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
              )}

              <Text style={styles.bitcoinText}>₿{tileData.bitcoinTokens}</Text>
            </View>
          </View>

          {/* Bottom half of hexagon */}
          <View style={[
            styles.hexagonBottom,
            {
              backgroundColor: getHexagonColor(),
              borderTopColor: getBorderColor(),
              borderTopWidth: isSelected ? 3 : 2,
            }
          ]} />

          {/* Transaction count badge */}
          {tileData.transactions.length > 0 && (
            <View style={styles.transactionBadge}>
              <Text style={styles.transactionCount}>{tileData.transactions.length}</Text>
            </View>
          )}

          {/* Owner badge */}
          {tileData.owner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerText}>{tileData.owner.substring(0, 2)}</Text>
            </View>
          )}
        </View>

        {/* Details panel when selected */}
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
              <Text style={styles.genesisLabel}>🌟 Genesis Block</Text>
            )}

            {tileData.isCurrentBlock && (
              <Text style={styles.currentLabel}>⏰ Current Block</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any, size: number) => StyleSheet.create({
  hexagonContainer: {
    width: size,
    height: size * 1.15,
    position: 'relative',
  },

  hexagonTop: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: size / 2,
    borderLeftColor: 'transparent',
    borderRightWidth: size / 2,
    borderRightColor: 'transparent',
    borderBottomWidth: size * 0.25,
  },

  hexagonMiddle: {
    width: size,
    height: size * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hexagonBottom: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: size / 2,
    borderLeftColor: 'transparent',
    borderRightWidth: size / 2,
    borderRightColor: 'transparent',
    borderTopWidth: size * 0.25,
  },

  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tileNumber: {
    fontSize: size * 0.28,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  statusIcon: {
    fontSize: size * 0.24,
    marginTop: 1,
  },

  bitcoinText: {
    fontSize: size * 0.20,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  transactionBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: size * 0.36,
    height: size * 0.36,
    borderRadius: size * 0.18,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  transactionCount: {
    fontSize: size * 0.20,
    color: '#FFF',
    fontWeight: theme.fonts.weights.bold,
  },

  ownerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: size * 0.36,
    height: size * 0.36,
    borderRadius: size * 0.18,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  ownerText: {
    fontSize: size * 0.18,
    color: '#FFF',
    fontWeight: theme.fonts.weights.bold,
  },

  detailsPanel: {
    position: 'absolute',
    top: size * 1.2,
    left: -30,
    right: -30,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 140,
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
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.secondary,
  },

  detailValue: {
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
  },

  genesisLabel: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.accent,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  currentLabel: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});
