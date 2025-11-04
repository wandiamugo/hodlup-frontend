import {
  GameState,
  Player,
  Wallet,
  Block,
  Card,
  CardType,
  WalletColor,
  CardShape,
  PlayerCard,
  BitcoinCard,
  HashCard,
} from './types';

/**
 * Initialize a new game with given players
 */
export function initializeGame(playerNames: string[]): GameState {
  const gameId = generateGameId();
  const walletColors = Object.values(WalletColor);

  // Create players and assign wallets
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player_${index}`,
    name,
    walletColor: walletColors[index % walletColors.length],
    hand: [],
    isActive: true,
    isCurrentTurn: index === 0,
  }));

  // Initialize all 6 wallets
  // Players start with 1 mining rig each
  const wallets: Wallet[] = walletColors.map((color) => {
    const player = players.find(p => p.walletColor === color);
    return {
      color,
      hotStorage: 0,
      coldStorage: 0,
      miningRigs: player ? 1 : 0, // Active players start with 1 mining rig
      playerId: player?.id,
      isAssigned: !!player, // Mark wallet as assigned if it has a player
    };
  });

  // Initialize blocks 11-31 (21 blocks total)
  const blocks: Block[] = [];
  for (let i = 11; i <= 31; i++) {
    blocks.push({
      number: i,
      bitcoinTokens: 1, // Each block starts with 1 bitcoin token (38 total distributed)
      transactions: [],
      isGenesis: i === 11,
      isMined: false,
      difficulty: calculateInitialDifficulty(i),
    });
  }

  // Create the deck
  const deck = createDeck();
  const shuffledDeck = shuffleDeck(deck);

  // Deal initial cards to players
  // Each player gets exactly 4 cards: Player, Bitcoin, Player, Hash (one complete transaction pattern)
  players.forEach((player) => {
    player.hand = dealInitialHand(shuffledDeck);
  });

  // Count starting mining rigs given to players
  const startingRigs = players.length; // Each player gets 1 rig

  const gameState: GameState = {
    gameId,
    players,
    wallets,
    blocks,
    currentBlock: 11, // Start at genesis block
    difficulty: calculateInitialDifficulty(11),
    availableMiningRigs: 12 - startingRigs, // 12 total rigs minus starting rigs given to players
    deck: shuffledDeck,
    discardPile: [],
    currentTurnPlayerId: players[0].id,
    round: 1,
    maxRounds: 17, // Game lasts 17 rounds (blocks 11-27, with halving at block 28)
    gameStatus: 'playing',
  };

  return gameState;
}

/**
 * Create a full deck of cards based on the HODL UP Card Math spreadsheet
 */
function createDeck(): Card[] {
  const cards: Card[] = [];

  // Symbol mapping for each color
  const colorSymbols: Record<WalletColor, string> = {
    [WalletColor.YELLOW]: '⚡', // lightning bolt
    [WalletColor.ORANGE]: 'pill', // pill (rendered specially)
    [WalletColor.WHITE]: '🐰', // rabbit
    [WalletColor.RED]: '∞', // infinity
    [WalletColor.GREEN]: '🔧', // wrench
    [WalletColor.BLUE]: '🧊', // cube
  };

  // People Cards distribution (from spreadsheet)
  // Each color has values 1-9 with different quantities
  const playerCardDistribution: Record<number, number> = {
    1: 6,  // 6 cards with value 1
    2: 6,  // 6 cards with value 2
    3: 6,  // 6 cards with value 3
    4: 12, // 12 cards with value 4
    5: 12, // 12 cards with value 5
    6: 12, // 12 cards with value 6
    7: 12, // 12 cards with value 7
    8: 12, // 12 cards with value 8
    9: 18, // 18 cards with value 9
  };

  // Total: 96 people cards (6 colors)
  const colors = Object.values(WalletColor);

  // Create people cards for each value
  Object.entries(playerCardDistribution).forEach(([valueStr, totalCount]) => {
    const value = parseInt(valueStr);
    const cardsPerColor = totalCount / colors.length;

    colors.forEach((color) => {
      for (let i = 0; i < cardsPerColor; i++) {
        cards.push({
          type: CardType.PLAYER,
          color,
          value,
          symbol: colorSymbols[color],
          id: `player_${color}_${value}_${i}`,
        } as PlayerCard);
      }
    });
  });

  // Create Bitcoin Cards (Trump cards)
  // Values: 1-9 with overlapping symbol counts
  // 1-5: 1 symbol, 3-7: 2 symbols, 5-9: 3 symbols, 6-9: 4 symbols
  // Create ALL possible combinations for each value

  // Value 1: only 1 symbol (1 card)
  cards.push({ type: CardType.BITCOIN, value: 1, symbolCount: 1, id: 'bitcoin_1_1' } as BitcoinCard);

  // Value 2: only 1 symbol (1 card)
  cards.push({ type: CardType.BITCOIN, value: 2, symbolCount: 1, id: 'bitcoin_2_1' } as BitcoinCard);

  // Value 3: can have 1 or 2 symbols (2 cards)
  cards.push({ type: CardType.BITCOIN, value: 3, symbolCount: 1, id: 'bitcoin_3_1' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 3, symbolCount: 2, id: 'bitcoin_3_2' } as BitcoinCard);

  // Value 4: can have 1 or 2 symbols (2 cards)
  cards.push({ type: CardType.BITCOIN, value: 4, symbolCount: 1, id: 'bitcoin_4_1' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 4, symbolCount: 2, id: 'bitcoin_4_2' } as BitcoinCard);

  // Value 5: can have 1, 2, or 3 symbols (3 cards)
  cards.push({ type: CardType.BITCOIN, value: 5, symbolCount: 1, id: 'bitcoin_5_1' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 5, symbolCount: 2, id: 'bitcoin_5_2' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 5, symbolCount: 3, id: 'bitcoin_5_3' } as BitcoinCard);

  // Value 6: can have 2, 3, or 4 symbols (3 cards)
  cards.push({ type: CardType.BITCOIN, value: 6, symbolCount: 2, id: 'bitcoin_6_2' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 6, symbolCount: 3, id: 'bitcoin_6_3' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 6, symbolCount: 4, id: 'bitcoin_6_4' } as BitcoinCard);

  // Value 7: can have 2, 3, or 4 symbols (3 cards)
  cards.push({ type: CardType.BITCOIN, value: 7, symbolCount: 2, id: 'bitcoin_7_2' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 7, symbolCount: 3, id: 'bitcoin_7_3' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 7, symbolCount: 4, id: 'bitcoin_7_4' } as BitcoinCard);

  // Value 8: can have 3 or 4 symbols (2 cards)
  cards.push({ type: CardType.BITCOIN, value: 8, symbolCount: 3, id: 'bitcoin_8_3' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 8, symbolCount: 4, id: 'bitcoin_8_4' } as BitcoinCard);

  // Value 9: can have 3 or 4 symbols (2 cards)
  cards.push({ type: CardType.BITCOIN, value: 9, symbolCount: 3, id: 'bitcoin_9_3' } as BitcoinCard);
  cards.push({ type: CardType.BITCOIN, value: 9, symbolCount: 4, id: 'bitcoin_9_4' } as BitcoinCard);

  // Total: 1+1+2+2+3+3+3+2+2 = 19 bitcoin cards

  // Create Hash Cards with values from -5 to 10 (including 0)
  // Total: 16 hash cards, each with a random recipient color
  const hashValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  hashValues.forEach((value) => {
    // Assign a random recipient color to each hash card
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    cards.push({
      type: CardType.HASH,
      recipientColor: randomColor,
      value: value,
      id: `hash_${value}`,
    } as HashCard);
  });

  return cards;
}

/**
 * Shuffle the deck using Fisher-Yates algorithm
 */
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate initial difficulty for a block
 */
function calculateInitialDifficulty(blockNumber: number): number {
  // Difficulty starts lower and increases
  if (blockNumber <= 15) return 10;
  if (blockNumber <= 20) return 12;
  if (blockNumber <= 25) return 15;
  return 18;
}

/**
 * Generate a unique game ID
 */
function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deal initial hand to a player
 * Pattern: Player Card, Bitcoin Card, Player Card, Hash Card (WRENCH pattern)
 */
function dealInitialHand(deck: Card[]): Card[] {
  const hand: Card[] = [];

  // Find and deal 1 Player card
  const playerCard1Index = deck.findIndex(c => c.type === CardType.PLAYER);
  if (playerCard1Index !== -1) {
    hand.push(deck.splice(playerCard1Index, 1)[0]);
  }

  // Find and deal 1 Bitcoin card
  const bitcoinCardIndex = deck.findIndex(c => c.type === CardType.BITCOIN);
  if (bitcoinCardIndex !== -1) {
    hand.push(deck.splice(bitcoinCardIndex, 1)[0]);
  }

  // Find and deal another Player card
  const playerCard2Index = deck.findIndex(c => c.type === CardType.PLAYER);
  if (playerCard2Index !== -1) {
    hand.push(deck.splice(playerCard2Index, 1)[0]);
  }

  // Find and deal 1 Hash card
  const hashCardIndex = deck.findIndex(c => c.type === CardType.HASH);
  if (hashCardIndex !== -1) {
    hand.push(deck.splice(hashCardIndex, 1)[0]);
  }

  return hand;
}

/**
 * Create a reference deck containing all possible card variations
 * This is used for the transaction builder UI to show all options
 */
export function createReferenceDeck(): Card[] {
  return createDeck();
}

/**
 * Distribute bitcoin tokens on the time-chain (blocks)
 * Total: 38 bitcoin tokens distributed across blocks 11-31
 */
export function distributeBitcoinTokens(blocks: Block[]): Block[] {
  const totalTokens = 38;
  const totalBlocks = blocks.length;

  // Distribute tokens (some blocks may get more than 1)
  let remainingTokens = totalTokens - totalBlocks; // Already placed 1 per block

  blocks.forEach((block) => {
    // Give extra tokens to earlier blocks (higher rewards)
    if (remainingTokens > 0 && block.number <= 20) {
      const extraTokens = Math.min(2, remainingTokens);
      block.bitcoinTokens += extraTokens;
      remainingTokens -= extraTokens;
    }
  });

  return blocks;
}
