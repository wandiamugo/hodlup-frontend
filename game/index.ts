// Main Game Engine Export
// HODL UP - Bitcoin Mining Board Game

// Types
export * from './types';

// Setup
export { initializeGame, distributeBitcoinTokens } from './setup';

// Wallet Management
export {
  moveToColdStorage,
  moveToHotStorage,
  buyMiningRig,
  addBitcoinToWallet,
  getWallet,
  getTotalBitcoin,
  hasMiningRigs,
  getPlayerWallets,
  calculateWalletScore,
} from './wallet';

// Card Management
export {
  drawCards,
  discardCard,
  playCards,
  hasCardType,
  getCardsByType,
  canCreateTransaction,
  validateTransactionPattern,
  getCardDisplayInfo,
} from './cards';

// Mining
export {
  performMining,
  buyRig,
  canMineBlock,
  mineBlock,
  calculateMiningReward,
  getAvailableMiningRigs,
  canAffordMiningRig,
} from './mining';

// Transactions & Blocks
export {
  createTransaction,
  validateTransaction,
  addTransactionToBlock,
  validateBlock,
  calculateBlockTotal,
  getBlock,
  getCurrentBlock,
  moveToNextBlock,
  validateBlockChain,
} from './transactions';

// Difficulty
export {
  adjustDifficulty,
  getDifficultyForBlock,
  calculateDifficultyAdjustment,
  needsDifficultyAdjustment,
  getDifficultyMessage,
  isHalvingBlock,
  getBlockReward,
} from './difficulty';

// Actions
export {
  executePlayAction,
  getAvailableActions,
  isGameOver,
  calculateFinalScores,
} from './actions';
