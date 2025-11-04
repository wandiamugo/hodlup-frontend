import { Card, CardType, Player, GameState, PlayerCard, BitcoinCard, HashCard } from './types';

/**
 * Draw cards from the deck
 */
export function drawCards(gameState: GameState, playerId: string, count: number): GameState {
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  if (gameState.deck.length < count) {
    // Reshuffle discard pile into deck if needed
    gameState.deck = [...gameState.deck, ...shuffleCards(gameState.discardPile)];
    gameState.discardPile = [];
  }

  if (gameState.deck.length < count) {
    throw new Error(`Not enough cards in deck. Available: ${gameState.deck.length}, Requested: ${count}`);
  }

  // Draw cards from deck
  const drawnCards = gameState.deck.splice(0, count);
  player.hand.push(...drawnCards);

  return { ...gameState };
}

/**
 * Discard a card from player's hand
 */
export function discardCard(gameState: GameState, playerId: string, cardId: string): GameState {
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);

  if (cardIndex === -1) {
    throw new Error(`Card ${cardId} not found in player's hand`);
  }

  // Remove from hand and add to discard pile
  const [card] = player.hand.splice(cardIndex, 1);
  gameState.discardPile.push(card);

  return { ...gameState };
}

/**
 * Play cards from hand (remove from hand without discarding)
 */
export function playCards(gameState: GameState, playerId: string, cardIds: string[]): Card[] {
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  const playedCards: Card[] = [];

  cardIds.forEach((cardId) => {
    const cardIndex = player.hand.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found in player's hand`);
    }

    const [card] = player.hand.splice(cardIndex, 1);
    playedCards.push(card);
  });

  return playedCards;
}

/**
 * Check if player has specific card types in hand
 */
export function hasCardType(player: Player, type: CardType): boolean {
  return player.hand.some((card) => card.type === type);
}

/**
 * Get all cards of a specific type from player's hand
 */
export function getCardsByType(player: Player, type: CardType): Card[] {
  return player.hand.filter((card) => card.type === type);
}

/**
 * Check if player has required cards for a transaction
 * Required: 1 Player card + 1 Bitcoin card + 1 Player card + 1 Hash card
 */
export function canCreateTransaction(player: Player): boolean {
  const playerCards = getCardsByType(player, CardType.PLAYER);
  const bitcoinCards = getCardsByType(player, CardType.BITCOIN);
  const hashCards = getCardsByType(player, CardType.HASH);

  return playerCards.length >= 2 && bitcoinCards.length >= 1 && hashCards.length >= 1;
}

/**
 * Validate transaction card pattern
 * Must be exactly: Player + Bitcoin + Player + Hash
 */
export function validateTransactionPattern(cards: Card[]): boolean {
  if (cards.length !== 4) {
    return false;
  }

  return (
    cards[0].type === CardType.PLAYER &&
    cards[1].type === CardType.BITCOIN &&
    cards[2].type === CardType.PLAYER &&
    cards[3].type === CardType.HASH
  );
}

/**
 * Shuffle cards (Fisher-Yates algorithm)
 */
function shuffleCards(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get card display info
 */
export function getCardDisplayInfo(card: Card): {
  type: string;
  label: string;
  color?: string;
  value?: number;
} {
  switch (card.type) {
    case CardType.PLAYER:
      const playerCard = card as PlayerCard;
      return {
        type: 'Player',
        label: `${playerCard.color} ${playerCard.value}`,
        color: playerCard.color,
        value: playerCard.value,
      };

    case CardType.BITCOIN:
      const bitcoinCard = card as BitcoinCard;
      return {
        type: 'Bitcoin',
        label: `₿${bitcoinCard.value}`,
        value: bitcoinCard.value,
      };

    case CardType.HASH:
      const hashCard = card as HashCard;
      return {
        type: 'Hash',
        label: `${hashCard.value} → ${hashCard.recipientColor}`,
        color: hashCard.recipientColor,
        value: hashCard.value,
      };

    default:
      return {
        type: 'Unknown',
        label: 'Unknown Card',
      };
  }
}
