import { GameState, WalletColor, Transaction, Block } from './types';
import { buyMiningRig as purchaseMiningRig, getWallet, hasMiningRigs } from './wallet';
import { drawCards } from './cards';

/**
 * Perform mining action
 * - Player with mining rigs can draw additional cards
 * - Player attempts to create a valid transaction
 */
export function performMining(
  gameState: GameState,
  playerId: string
): GameState {
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  const wallet = getWallet(gameState, player.walletColor);

  if (!wallet) {
    throw new Error(`Wallet for player ${playerId} not found`);
  }

  // Check if player has mining rigs
  if (!hasMiningRigs(wallet)) {
    throw new Error('Player must have at least one mining rig to mine');
  }

  // Draw one card per mining rig owned (no maximum limit)
  const cardsToDraw = wallet.miningRigs;
  gameState = drawCards(gameState, playerId, cardsToDraw);

  return gameState;
}

/**
 * Buy a mining rig (wrapper around wallet buyMiningRig)
 */
export function buyRig(
  gameState: GameState,
  walletColor: WalletColor
): GameState {
  return purchaseMiningRig(gameState, walletColor);
}

/**
 * Check if a block can be mined (has transactions and meets difficulty)
 */
export function canMineBlock(block: Block, difficulty: number): boolean {
  if (block.transactions.length === 0) {
    return false;
  }

  // Calculate total transaction value
  const totalValue = block.transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Block can be mined if total value <= difficulty
  return totalValue <= difficulty;
}

/**
 * Mine a block and distribute rewards
 */
export function mineBlock(
  gameState: GameState,
  blockNumber: number,
  minedBy: WalletColor
): GameState {
  const block = gameState.blocks.find((b) => b.number === blockNumber);

  if (!block) {
    throw new Error(`Block ${blockNumber} not found`);
  }

  if (block.isMined) {
    throw new Error(`Block ${blockNumber} already mined`);
  }

  if (!canMineBlock(block, gameState.difficulty)) {
    throw new Error(`Block ${blockNumber} does not meet difficulty requirements`);
  }

  // Mark block as mined
  block.isMined = true;
  block.minedBy = minedBy;

  // Distribute block reward (bitcoin tokens) to the miner
  const wallet = gameState.wallets.find((w) => w.color === minedBy);

  if (wallet) {
    wallet.hotStorage += block.bitcoinTokens;
  }

  return gameState;
}

/**
 * Calculate mining reward for a block
 */
export function calculateMiningReward(blockNumber: number): number {
  // Reward decreases with block number (halving effect)
  if (blockNumber <= 15) return 6;
  if (blockNumber <= 20) return 4;
  if (blockNumber <= 25) return 2;
  return 1;
}

/**
 * Get available mining rigs for purchase
 */
export function getAvailableMiningRigs(gameState: GameState): number {
  return gameState.availableMiningRigs;
}

/**
 * Check if player can afford a mining rig
 */
export function canAffordMiningRig(gameState: GameState, walletColor: WalletColor): boolean {
  const wallet = getWallet(gameState, walletColor);

  if (!wallet) {
    return false;
  }

  const cost = 1; // Mining rigs cost 1 bitcoin token
  return wallet.hotStorage >= cost && gameState.availableMiningRigs > 0;
}
