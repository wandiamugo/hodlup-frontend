import {
  Transaction,
  Card,
  CardType,
  PlayerCard,
  BitcoinCard,
  HashCard,
  GameState,
  Block,
} from './types';
import { validateTransactionPattern } from './cards';

/**
 * Create a transaction from cards
 * Pattern: Player + Bitcoin + Player + Hash
 */
export function createTransaction(
  gameState: GameState,
  blockNumber: number,
  cards: Card[]
): Transaction {
  // Validate card pattern
  if (!validateTransactionPattern(cards)) {
    throw new Error('Invalid transaction pattern. Must be: Player + Bitcoin + Player + Hash');
  }

  const [senderCard, bitcoinCard, receiverCard, hashCard] = cards as [
    PlayerCard,
    BitcoinCard,
    PlayerCard,
    HashCard
  ];

  // Validate that sender and receiver are different
  if (senderCard.color === receiverCard.color) {
    throw new Error('Sender and receiver must be different wallets');
  }

  const transaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cards: [senderCard, bitcoinCard, receiverCard, hashCard],
    from: senderCard.color,
    to: hashCard.recipientColor,
    amount: bitcoinCard.value,
    blockNumber,
    isValid: false, // Will be validated later
  };

  // Validate the transaction
  transaction.isValid = validateTransaction(gameState, transaction);

  return transaction;
}

/**
 * Validate a transaction
 */
export function validateTransaction(
  gameState: GameState,
  transaction: Transaction
): boolean {
  // Check pattern is correct
  if (!validateTransactionPattern(transaction.cards)) {
    return false;
  }

  // Check sender has enough bitcoin
  const senderWallet = gameState.wallets.find((w) => w.color === transaction.from);
  if (!senderWallet || senderWallet.hotStorage < transaction.amount) {
    return false;
  }

  // Check receiver wallet exists
  const receiverWallet = gameState.wallets.find((w) => w.color === transaction.to);
  if (!receiverWallet) {
    return false;
  }

  return true;
}

/**
 * Add transaction to a block
 */
export function addTransactionToBlock(
  gameState: GameState,
  blockNumber: number,
  transaction: Transaction
): GameState {
  const block = gameState.blocks.find((b) => b.number === blockNumber);

  if (!block) {
    throw new Error(`Block ${blockNumber} not found`);
  }

  if (block.isMined) {
    throw new Error(`Block ${blockNumber} is already mined`);
  }

  if (!transaction.isValid) {
    throw new Error('Cannot add invalid transaction to block');
  }

  // Add transaction to block
  block.transactions.push(transaction);

  // Execute the transaction (move bitcoin between wallets)
  executeTransaction(gameState, transaction);

  return gameState;
}

/**
 * Execute a transaction (transfer bitcoin between wallets)
 */
function executeTransaction(gameState: GameState, transaction: Transaction): void {
  const senderWallet = gameState.wallets.find((w) => w.color === transaction.from);
  const receiverWallet = gameState.wallets.find((w) => w.color === transaction.to);

  if (!senderWallet || !receiverWallet) {
    throw new Error('Sender or receiver wallet not found');
  }

  if (senderWallet.hotStorage < transaction.amount) {
    throw new Error('Insufficient funds in sender wallet');
  }

  // Transfer bitcoin
  senderWallet.hotStorage -= transaction.amount;
  receiverWallet.hotStorage += transaction.amount;
}

/**
 * Validate a block (check if all transactions are valid and meet difficulty)
 */
export function validateBlock(block: Block, difficulty: number): boolean {
  if (block.transactions.length === 0) {
    return false;
  }

  // Check all transactions are valid
  const allValid = block.transactions.every((tx) => tx.isValid);
  if (!allValid) {
    return false;
  }

  // Calculate total transaction value
  const totalValue = calculateBlockTotal(block);

  // Block total must be <= difficulty
  return totalValue <= difficulty;
}

/**
 * Calculate total value of transactions in a block
 */
export function calculateBlockTotal(block: Block): number {
  return block.transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get block by number
 */
export function getBlock(gameState: GameState, blockNumber: number): Block | undefined {
  return gameState.blocks.find((b) => b.number === blockNumber);
}

/**
 * Get current block
 */
export function getCurrentBlock(gameState: GameState): Block | undefined {
  return getBlock(gameState, gameState.currentBlock);
}

/**
 * Move to next block
 */
export function moveToNextBlock(gameState: GameState): GameState {
  const currentBlock = getCurrentBlock(gameState);

  if (!currentBlock) {
    throw new Error('Current block not found');
  }

  // Check if current block can be mined
  if (currentBlock.transactions.length > 0 && !currentBlock.isMined) {
    throw new Error('Current block has unmined transactions. Mine the block before moving to the next one.');
  }

  // Move to next block
  if (gameState.currentBlock < 31) {
    gameState.currentBlock += 1;
  } else {
    // Game over
    gameState.gameStatus = 'finished';
  }

  return gameState;
}

/**
 * Check if first hash of new block equals last hash of previous block
 * (Validation Criteria from game rules)
 */
export function validateBlockChain(blocks: Block[]): boolean {
  for (let i = 1; i < blocks.length; i++) {
    const prevBlock = blocks[i - 1];
    const currentBlock = blocks[i];

    if (currentBlock.transactions.length === 0 || prevBlock.transactions.length === 0) {
      continue;
    }

    // Get last transaction of previous block
    const prevLastTx = prevBlock.transactions[prevBlock.transactions.length - 1];
    const prevLastHash = prevLastTx.cards[3] as HashCard;

    // Get first transaction of current block
    const currentFirstTx = currentBlock.transactions[0];
    const currentFirstHash = currentFirstTx.cards[3] as HashCard;

    // Validate: first hash of new block = last hash of previous block
    if (currentFirstHash.recipientColor !== prevLastHash.recipientColor) {
      return false;
    }
  }

  return true;
}
