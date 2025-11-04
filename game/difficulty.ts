import { GameState, Block } from './types';

/**
 * Adjust difficulty based on block number and mining success rate
 */
export function adjustDifficulty(gameState: GameState): GameState {
  const currentBlockNumber = gameState.currentBlock;

  // Calculate new difficulty based on block number
  let newDifficulty = calculateDifficultyByBlock(currentBlockNumber);

  // Adjust based on recent mining success rate
  const recentBlocks = getRecentMinedBlocks(gameState, 3);
  const successRate = recentBlocks.filter((b) => b.isMined).length / recentBlocks.length;

  // If too many blocks are being mined successfully, increase difficulty
  if (successRate > 0.8) {
    newDifficulty = Math.floor(newDifficulty * 0.9); // Make it harder (lower threshold)
  }
  // If too few blocks are being mined, decrease difficulty
  else if (successRate < 0.3) {
    newDifficulty = Math.floor(newDifficulty * 1.1); // Make it easier (higher threshold)
  }

  gameState.difficulty = newDifficulty;

  return gameState;
}

/**
 * Calculate difficulty based on block number
 * Difficulty increases as the game progresses
 */
function calculateDifficultyByBlock(blockNumber: number): number {
  // Early blocks (11-15): Easier difficulty
  if (blockNumber <= 15) return 12;

  // Mid blocks (16-20): Medium difficulty
  if (blockNumber <= 20) return 10;

  // Later blocks (21-25): Harder difficulty
  if (blockNumber <= 25) return 8;

  // Final blocks (26-31): Hardest difficulty
  return 6;
}

/**
 * Get recent blocks for difficulty calculation
 */
function getRecentMinedBlocks(gameState: GameState, count: number): Block[] {
  const currentIndex = gameState.blocks.findIndex(
    (b) => b.number === gameState.currentBlock
  );

  if (currentIndex < 0) return [];

  const startIndex = Math.max(0, currentIndex - count);
  return gameState.blocks.slice(startIndex, currentIndex);
}

/**
 * Get difficulty adjustment for a specific block
 */
export function getDifficultyForBlock(blockNumber: number): number {
  return calculateDifficultyByBlock(blockNumber);
}

/**
 * Calculate mining difficulty adjustment based on game progress
 * This simulates Bitcoin's difficulty adjustment mechanism
 */
export function calculateDifficultyAdjustment(
  totalBlocks: number,
  minedBlocks: number,
  targetTime: number,
  actualTime: number
): number {
  // If mining is happening too fast, increase difficulty (lower threshold)
  if (actualTime < targetTime) {
    return Math.floor((totalBlocks / minedBlocks) * 0.9);
  }
  // If mining is happening too slow, decrease difficulty (higher threshold)
  else if (actualTime > targetTime) {
    return Math.floor((totalBlocks / minedBlocks) * 1.1);
  }

  return totalBlocks / minedBlocks;
}

/**
 * Check if difficulty needs adjustment
 */
export function needsDifficultyAdjustment(gameState: GameState): boolean {
  // Adjust difficulty every 3 blocks
  return gameState.currentBlock % 3 === 0;
}

/**
 * Get difficulty criteria message for UI
 */
export function getDifficultyMessage(difficulty: number): string {
  if (difficulty >= 12) return 'Easy - Block total must be ≤ ' + difficulty;
  if (difficulty >= 9) return 'Medium - Block total must be ≤ ' + difficulty;
  if (difficulty >= 7) return 'Hard - Block total must be ≤ ' + difficulty;
  return 'Very Hard - Block total must be ≤ ' + difficulty;
}

/**
 * Halving event (reward reduction)
 * Occurs at specific block numbers
 */
export function isHalvingBlock(blockNumber: number): boolean {
  // Halving occurs at blocks 20 and 28 (similar to Bitcoin)
  return blockNumber === 20 || blockNumber === 28;
}

/**
 * Get block reward after potential halving
 */
export function getBlockReward(blockNumber: number): number {
  if (blockNumber < 20) return 6; // Initial reward
  if (blockNumber < 28) return 3; // After first halving
  return 1; // After second halving
}
