import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

interface WalletManagerProps {
  visible: boolean;
  hotStorage: number;
  coldStorage: number;
  miningRigs: number;
  onMoveToCold: (amount: number) => void;
  onMoveToHot: (amount: number) => void;
  onClose: () => void;
  theme: any;
}

export default function WalletManager({
  visible,
  hotStorage,
  coldStorage,
  miningRigs,
  onMoveToCold,
  onMoveToHot,
  onClose,
  theme,
}: WalletManagerProps) {
  const [amount, setAmount] = useState('1');
  const styles = createStyles(theme);

  const handleMoveToCold = () => {
    const numAmount = parseInt(amount, 10);
    if (numAmount > 0 && numAmount <= hotStorage) {
      onMoveToCold(numAmount);
      setAmount('1');
    }
  };

  const handleMoveToHot = () => {
    const numAmount = parseInt(amount, 10);
    if (numAmount > 0 && numAmount <= coldStorage) {
      onMoveToHot(numAmount);
      setAmount('1');
    }
  };

  const totalBitcoin = hotStorage + coldStorage;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💰 Wallet Management</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Wallet Overview */}
          <View style={styles.overview}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Bitcoin</Text>
              <Text style={styles.totalValue}>₿{totalBitcoin}</Text>
            </View>

            <View style={styles.storageContainer}>
              {/* Hot Storage */}
              <View style={styles.storageBox}>
                <Text style={styles.storageIcon}>🔥</Text>
                <Text style={styles.storageLabel}>Hot Storage</Text>
                <Text style={styles.storageValue}>₿{hotStorage}</Text>
                <Text style={styles.storageDescription}>
                  Available for transactions
                </Text>
              </View>

              {/* Cold Storage */}
              <View style={styles.storageBox}>
                <Text style={styles.storageIcon}>🧊</Text>
                <Text style={styles.storageLabel}>Cold Storage</Text>
                <Text style={styles.storageValue}>₿{coldStorage}</Text>
                <Text style={styles.storageDescription}>
                  Secure & protected
                </Text>
              </View>
            </View>

            {/* Mining Rigs */}
            <View style={styles.rigsSection}>
              <Text style={styles.rigsIcon}>⛏️</Text>
              <Text style={styles.rigsLabel}>Mining Rigs: {miningRigs}</Text>
            </View>
          </View>

          {/* Transfer Amount Input */}
          <View style={styles.transferSection}>
            <Text style={styles.transferLabel}>Transfer Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.toColdButton,
                hotStorage === 0 && styles.buttonDisabled,
              ]}
              onPress={handleMoveToCold}
              disabled={hotStorage === 0}
            >
              <Text style={styles.actionIcon}>🔥→🧊</Text>
              <Text style={styles.actionText}>Move to Cold</Text>
              <Text style={styles.actionSubtext}>Secure your bitcoin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.toHotButton,
                coldStorage === 0 && styles.buttonDisabled,
              ]}
              onPress={handleMoveToHot}
              disabled={coldStorage === 0}
            >
              <Text style={styles.actionIcon}>🧊→🔥</Text>
              <Text style={styles.actionText}>Move to Hot</Text>
              <Text style={styles.actionSubtext}>Make available</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Cold storage is secure but cannot be used for transactions.
              Hot storage is available but at risk of being spent.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },

  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
  },

  title: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: theme.fonts.weights.bold,
  },

  overview: {
    marginBottom: theme.spacing.large,
  },

  totalSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.borderRadius.medium,
  },

  totalLabel: {
    fontSize: theme.fonts.sizes.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },

  totalValue: {
    fontSize: theme.fonts.sizes.xxlarge || 32,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.accent,
  },

  storageContainer: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },

  storageBox: {
    flex: 1,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  storageIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.small,
  },

  storageLabel: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },

  storageValue: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },

  storageDescription: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  rigsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.medium,
  },

  rigsIcon: {
    fontSize: 24,
    marginRight: theme.spacing.small,
  },

  rigsLabel: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
  },

  transferSection: {
    marginBottom: theme.spacing.large,
  },

  transferLabel: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },

  amountInput: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },

  actionButton: {
    flex: 1,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 2,
  },

  toColdButton: {
    backgroundColor: theme.colors.primary + '30',
    borderColor: theme.colors.primary,
  },

  toHotButton: {
    backgroundColor: theme.colors.warning + '30',
    borderColor: theme.colors.warning,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.small,
  },

  actionText: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },

  actionSubtext: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text.secondary,
  },

  infoBox: {
    flexDirection: 'row',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },

  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.small,
  },

  infoText: {
    flex: 1,
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
});
