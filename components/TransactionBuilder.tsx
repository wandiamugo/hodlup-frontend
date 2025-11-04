import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card, CardType } from '../game/types';
import { getCardDisplayInfo } from '../game/cards';
import { CardRenderer } from './UI/PlayerCard';

interface TransactionBuilderProps {
  playerHand: Card[];
  availableDeck: Card[]; // All cards available to select from
  onTransactionCreate: (cards: Card[]) => void;
  onCancel: () => void;
  theme: any;
}

export default function TransactionBuilder({
  playerHand,
  availableDeck,
  onTransactionCreate,
  onCancel,
  theme,
}: TransactionBuilderProps) {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const styles = createStyles(theme);

  const isCardSelected = (card: Card) => {
    return selectedCards.some((c) => c.id === card.id);
  };

  const handleCardPress = (card: Card) => {
    if (isCardSelected(card)) {
      // Deselect card
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else {
      // Select card (max 4 cards)
      if (selectedCards.length < 4) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const isValidPattern = () => {
    if (selectedCards.length !== 4) return false;

    return (
      selectedCards[0]?.type === CardType.PLAYER &&
      selectedCards[1]?.type === CardType.BITCOIN &&
      selectedCards[2]?.type === CardType.PLAYER &&
      selectedCards[3]?.type === CardType.HASH
    );
  };

  const renderCard = (card: Card) => {
    const selected = isCardSelected(card);

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.cardWrapper,
          selected && styles.cardSelected,
        ]}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContainer}>
          <CardRenderer card={card} />
        </View>
        {selected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              {selectedCards.findIndex((c) => c.id === card.id) + 1}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getCardsByType = (type: CardType) => {
    // Combine player's hand and available deck for selection
    const allAvailableCards = [...playerHand, ...availableDeck];

    // Remove duplicates by card ID
    const uniqueCards = allAvailableCards.filter(
      (card, index, self) => self.findIndex(c => c.id === card.id) === index
    );

    const cardsOfType = uniqueCards.filter((card) => card.type === type);

    // For hash cards, show all combinations of value and recipient color
    if (type === CardType.HASH) {
      const cardsByValueAndColor = new Map<string, Card>();
      cardsOfType.forEach(card => {
        const hashCard = card as any;
        const key = `${hashCard.value}_${hashCard.recipientColor}`;
        if (!cardsByValueAndColor.has(key)) {
          cardsByValueAndColor.set(key, card);
        }
      });

      // Sort by value first, then by recipient color
      return Array.from(cardsByValueAndColor.values())
        .sort((a, b) => {
          const aCard = a as any;
          const bCard = b as any;
          if (aCard.value !== bCard.value) {
            return aCard.value - bCard.value;
          }
          return aCard.recipientColor.localeCompare(bCard.recipientColor);
        });
    }

    return cardsOfType;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Build Transaction</Text>
        <Text style={styles.subtitle}>
          Pattern: Player → Bitcoin → Player → Hash
        </Text>
      </View>

      {/* Selected Cards Preview */}
      <View style={styles.selectedPreview}>
        {[0, 1, 2, 3].map((index) => {
          const card = selectedCards[index];
          const expectedType = [CardType.PLAYER, CardType.BITCOIN, CardType.PLAYER, CardType.HASH][index];

          return (
            <View
              key={index}
              style={[
                styles.previewSlot,
                card && styles.previewSlotFilled,
                card && card.type !== expectedType && styles.previewSlotError,
              ]}
            >
              {card ? (
                <Text style={styles.previewText}>
                  {getCardDisplayInfo(card).label}
                </Text>
              ) : (
                <Text style={styles.previewPlaceholder}>
                  {index === 0 ? '👤' : index === 1 ? '₿' : index === 2 ? '👤' : '#'}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Cards by Type */}
      <ScrollView style={styles.cardsContainer}>
        {/* Player Cards */}
        <View style={styles.cardTypeSection}>
          <Text style={styles.cardTypeLabel}>👤 Player Cards</Text>
          <View style={styles.cardGrid}>
            {getCardsByType(CardType.PLAYER).map(renderCard)}
          </View>
        </View>

        {/* Bitcoin Cards */}
        <View style={styles.cardTypeSection}>
          <Text style={styles.cardTypeLabel}>₿ Bitcoin Cards</Text>
          <View style={styles.cardGrid}>
            {getCardsByType(CardType.BITCOIN).map(renderCard)}
          </View>
        </View>

        {/* Hash Cards */}
        <View style={styles.cardTypeSection}>
          <Text style={styles.cardTypeLabel}># Hash Cards</Text>
          <View style={styles.cardGrid}>
            {getCardsByType(CardType.HASH).map(renderCard)}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            !isValidPattern() && styles.buttonDisabled,
          ]}
          onPress={() => isValidPattern() && onTransactionCreate(selectedCards)}
          disabled={!isValidPattern()}
        >
          <Text style={styles.buttonText}>
            {isValidPattern() ? 'Create Transaction ✓' : 'Invalid Pattern'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
  },

  header: {
    marginBottom: theme.spacing.medium,
  },

  title: {
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: theme.fonts.sizes.small,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },

  selectedPreview: {
    flexDirection: 'row',
    gap: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    justifyContent: 'center',
  },

  previewSlot: {
    width: 70,
    height: 80,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
  },

  previewSlotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '20',
  },

  previewSlotError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '20',
  },

  previewText: {
    fontSize: theme.fonts.sizes.small,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },

  previewPlaceholder: {
    fontSize: 24,
    opacity: 0.3,
  },

  cardsContainer: {
    flex: 1,
    marginBottom: theme.spacing.medium,
  },

  cardTypeSection: {
    marginBottom: theme.spacing.large,
  },

  cardTypeLabel: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.small,
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
  },

  cardWrapper: {
    width: 70,
    height: 90,
    position: 'relative',
  },

  cardContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  cardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },

  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedBadgeText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.bold,
    color: '#FFF',
  },

  actions: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },

  button: {
    flex: 1,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: theme.colors.error,
  },

  createButton: {
    backgroundColor: theme.colors.success,
  },

  buttonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },

  buttonText: {
    fontSize: theme.fonts.sizes.medium,
    fontWeight: theme.fonts.weights.bold,
    color: '#FFF',
  },
});
