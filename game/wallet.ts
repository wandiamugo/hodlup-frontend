import { Wallet, WalletColor, GameState } from './types';

/**
 * Move bitcoin tokens from hot storage to cold storage
 */
export function moveToColdStorage(
  gameState: GameState,
  walletColor: WalletColor,
  amount: number
): GameState {
  const wallet = gameState.wallets.find((w) => w.color === walletColor);

  if (!wallet) {
    throw new Error(`Wallet ${walletColor} not found`);
  }

  if (wallet.hotStorage < amount) {
    throw new Error(`Insufficient bitcoin in hot storage. Available: ${wallet.hotStorage}, Requested: ${amount}`);
  }

  // Move from hot to cold
  wallet.hotStorage -= amount;
  wallet.coldStorage += amount;

  return { ...gameState };
}

/**
 * Move bitcoin tokens from cold storage back to hot storage
 */
export function moveToHotStorage(
  gameState: GameState,
  walletColor: WalletColor,
  amount: number
): GameState {
  const wallet = gameState.wallets.find((w) => w.color === walletColor);

  if (!wallet) {
    throw new Error(`Wallet ${walletColor} not found`);
  }

  if (wallet.coldStorage < amount) {
    throw new Error(`Insufficient bitcoin in cold storage. Available: ${wallet.coldStorage}, Requested: ${amount}`);
  }

  // Move from cold to hot
  wallet.coldStorage -= amount;
  wallet.hotStorage += amount;

  return { ...gameState };
}

/**
 * Buy a mining rig for 1 bitcoin token
 */
export function buyMiningRig(
  gameState: GameState,
  walletColor: WalletColor
): GameState {
  const wallet = gameState.wallets.find((w) => w.color === walletColor);

  if (!wallet) {
    throw new Error(`Wallet ${walletColor} not found`);
  }

  // Check if mining rigs are available
  if (gameState.availableMiningRigs <= 0) {
    throw new Error('No mining rigs available for purchase');
  }

  // Check if player has enough bitcoin in hot storage
  const cost = 1;
  if (wallet.hotStorage < cost) {
    throw new Error(`Insufficient bitcoin. Cost: ${cost}, Available: ${wallet.hotStorage}`);
  }

  // Purchase the mining rig
  wallet.hotStorage -= cost;
  wallet.miningRigs += 1;
  gameState.availableMiningRigs -= 1;

  return { ...gameState };
}

/**
 * Add bitcoin tokens to a wallet's hot storage (e.g., from mining rewards)
 */
export function addBitcoinToWallet(
  gameState: GameState,
  walletColor: WalletColor,
  amount: number
): GameState {
  const wallet = gameState.wallets.find((w) => w.color === walletColor);

  if (!wallet) {
    throw new Error(`Wallet ${walletColor} not found`);
  }

  wallet.hotStorage += amount;

  return { ...gameState };
}

/**
 * Get wallet by color
 */
export function getWallet(
  gameState: GameState,
  walletColor: WalletColor
): Wallet | undefined {
  return gameState.wallets.find((w) => w.color === walletColor);
}

/**
 * Get total bitcoin (hot + cold) for a wallet
 */
export function getTotalBitcoin(wallet: Wallet): number {
  return wallet.hotStorage + wallet.coldStorage;
}

/**
 * Check if wallet has any mining rigs
 */
export function hasMiningRigs(wallet: Wallet): boolean {
  return wallet.miningRigs > 0;
}

/**
 * Get all wallets controlled by players
 */
export function getPlayerWallets(gameState: GameState): Wallet[] {
  return gameState.wallets.filter((w) => w.playerId !== undefined);
}

/**
 * Calculate score for a wallet (for end game)
 * Score = total bitcoin * mining rigs multiplier
 */
export function calculateWalletScore(wallet: Wallet): number {
  const totalBitcoin = getTotalBitcoin(wallet);
  const rigMultiplier = 1 + (wallet.miningRigs * 0.1); // Each rig adds 10% bonus
  return Math.floor(totalBitcoin * rigMultiplier);
}
