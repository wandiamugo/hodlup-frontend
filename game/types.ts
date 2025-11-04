// Game Types for HODL UP

export enum WalletColor {
  YELLOW = 'yellow',
  ORANGE = 'orange',
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
}

export enum CardType {
  PLAYER = 'player',
  BITCOIN = 'bitcoin',
  HASH = 'hash',
}

export enum CardShape {
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
}

export interface PlayerCard {
  type: CardType.PLAYER;
  color: WalletColor;
  value: number; // 1-9
  symbol?: string; // The symbol displayed (pill, ∞, ₿, 🐰, ⚡, 🧊, 🔧)
  id: string;
}

export interface BitcoinCard {
  type: CardType.BITCOIN;
  value: number; // Amount of bitcoin tokens this represents
  symbolCount: number; // Number of bitcoin symbols to display (1-4)
  id: string;
}

export interface HashCard {
  type: CardType.HASH;
  recipientColor: WalletColor; // Who receives the bitcoin
  value: number; // Hash value
  id: string;
}

export type Card = PlayerCard | BitcoinCard | HashCard;

export interface Wallet {
  color: WalletColor;
  hotStorage: number; // Bitcoin tokens in hot storage
  coldStorage: number; // Bitcoin tokens in cold storage (secure)
  miningRigs: number; // Number of mining rigs owned (0-12)
  playerId?: string; // ID of player controlling this wallet
  isAssigned: boolean; // Whether this wallet is assigned to a player
}

export interface Block {
  number: number; // Block number (11-31)
  bitcoinTokens: number; // Bitcoin tokens on this block
  transactions: Transaction[];
  isGenesis: boolean;
  isMined: boolean;
  minedBy?: WalletColor;
  difficulty: number;
}

export interface Transaction {
  id: string;
  cards: [PlayerCard, BitcoinCard, PlayerCard, HashCard]; // Exact pattern required
  from: WalletColor; // Sender (first player card)
  to: WalletColor; // Receiver (hash card)
  amount: number; // From bitcoin card
  blockNumber: number;
  isValid: boolean;
}

export interface Player {
  id: string;
  name: string;
  walletColor: WalletColor;
  hand: Card[]; // Cards in hand
  isActive: boolean;
  isCurrentTurn: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  wallets: Wallet[];
  blocks: Block[];
  currentBlock: number;
  difficulty: number;
  availableMiningRigs: number; // Total of 12
  deck: Card[]; // Draw pile
  discardPile: Card[];
  currentTurnPlayerId: string;
  round: number;
  maxRounds: number;
  gameStatus: 'setup' | 'playing' | 'finished';
}

export enum PlayOption {
  MINE = 'mine',
  BUY_MINING_RIG = 'buy_mining_rig',
  MOVE_TO_COLD_STORAGE = 'move_to_cold_storage',
  MOVE_TO_NEXT_BLOCK = 'move_to_next_block',
}

export interface PlayAction {
  type: PlayOption;
  playerId: string;
  data?: any;
}
