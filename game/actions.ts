import { GameState, PlayOption, PlayAction, Card } from './types';
import { performMining, buyRig, canAffordMiningRig } from './mining';
import { moveToColdStorage, moveToHotStorage } from './wallet';
import { moveToNextBlock, createTransaction, addTransactionToBlock } from './transactions';
import { drawCards } from './cards';
import { adjustDifficulty, needsDifficultyAdjustment } from './difficulty';

/**
 * Execute a play action
 */
export function executePlayAction(
  gameState: GameState,
  action: PlayAction
): GameState {
  const player = gameState.players.find((p) => p.id === action.playerId);

  if (!player) {
    throw new Error(`Player ${action.playerId} not found`);
  }

  if (!player.isCurrentTurn) {
    throw new Error('Not your turn');
  }

  switch (action.type) {
    case PlayOption.MINE:
      return handleMineAction(gameState, action);

    case PlayOption.BUY_MINING_RIG:
      return handleBuyMiningRigAction(gameState, action);

    case PlayOption.MOVE_TO_COLD_STORAGE:
      return handleMoveToColdStorageAction(gameState, action);

    case PlayOption.MOVE_TO_NEXT_BLOCK:
      return handleMoveToNextBlockAction(gameState, action);

    default:
      throw new Error(`Unknown play action: ${action.type}`);
  }
}

/**
 * Handle mining action
 */
function handleMineAction(gameState: GameState, action: PlayAction): GameState {
  const { playerId, data } = action;
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error('Player not found');
  }

  // Perform mining (draws cards based on mining rigs)
  gameState = performMining(gameState, playerId);

  // If player provided cards for a transaction, create it
  if (data && data.transactionCards) {
    const cards: Card[] = data.transactionCards;
    const transaction = createTransaction(gameState, gameState.currentBlock, cards);

    if (transaction.isValid) {
      gameState = addTransactionToBlock(gameState, gameState.currentBlock, transaction);

      // IMPORTANT: Remove the used cards from player's hand
      player.hand = player.hand.filter(
        (handCard) => !cards.some((usedCard) => usedCard.id === handCard.id)
      );

      // Add used cards to discard pile
      gameState.discardPile.push(...cards);
    }
  }

  // End turn
  gameState = endTurn(gameState);

  return gameState;
}

/**
 * Handle buy mining rig action
 * Player pays 1 bitcoin -> goes to cold storage of unassigned wallet
 * Player receives 1 mining rig from the pool
 */
function handleBuyMiningRigAction(gameState: GameState, action: PlayAction): GameState {
  const player = gameState.players.find((p) => p.id === action.playerId);

  if (!player) {
    throw new Error('Player not found');
  }

  if (!canAffordMiningRig(gameState, player.walletColor)) {
    throw new Error('Cannot afford mining rig');
  }

  // Buy the rig (deducts 1 bitcoin from player's hot storage)
  gameState = buyRig(gameState, player.walletColor);

  // Move 1 bitcoin to cold storage of an unassigned wallet
  const unassignedWallet = gameState.wallets.find(w => !w.isAssigned);
  if (unassignedWallet) {
    unassignedWallet.coldStorage += 1;
  }

  // End turn
  gameState = endTurn(gameState);

  return gameState;
}

/**
 * Handle move to cold storage action
 * Player can move 1 or 2 bitcoin tokens from hot to cold storage
 */
function handleMoveToColdStorageAction(gameState: GameState, action: PlayAction): GameState {
  const { playerId, data } = action;
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player) {
    throw new Error('Player not found');
  }

  const amount = data?.amount || 1;

  // Validate amount is 1 or 2
  if (amount < 1 || amount > 2) {
    throw new Error('Can only move 1 or 2 bitcoin tokens to cold storage');
  }

  gameState = moveToColdStorage(gameState, player.walletColor, amount);

  // End turn
  gameState = endTurn(gameState);

  return gameState;
}

/**
 * Handle move to next block action
 */
function handleMoveToNextBlockAction(gameState: GameState, action: PlayAction): GameState {
  gameState = moveToNextBlock(gameState);

  // Check if difficulty needs adjustment
  if (needsDifficultyAdjustment(gameState)) {
    gameState = adjustDifficulty(gameState);
  }

  // End turn
  gameState = endTurn(gameState);

  return gameState;
}

/**
 * End current turn and move to next player
 */
function endTurn(gameState: GameState): GameState {
  const currentPlayerIndex = gameState.players.findIndex(
    (p) => p.id === gameState.currentTurnPlayerId
  );

  if (currentPlayerIndex === -1) {
    throw new Error('Current player not found');
  }

  // Set current player's turn to false
  gameState.players[currentPlayerIndex].isCurrentTurn = false;

  // Move to next active player
  let nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;

  // Skip inactive players
  while (!gameState.players[nextPlayerIndex].isActive) {
    nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;

    // Prevent infinite loop
    if (nextPlayerIndex === currentPlayerIndex) {
      throw new Error('No active players found');
    }
  }

  // Set next player's turn
  gameState.players[nextPlayerIndex].isCurrentTurn = true;
  gameState.currentTurnPlayerId = gameState.players[nextPlayerIndex].id;

  // Increment round if we've completed a full cycle
  if (nextPlayerIndex === 0) {
    gameState.round += 1;
  }

  return gameState;
}

/**
 * Get available actions for a player
 */
export function getAvailableActions(
  gameState: GameState,
  playerId: string
): PlayOption[] {
  const player = gameState.players.find((p) => p.id === playerId);

  if (!player || !player.isCurrentTurn) {
    return [];
  }

  const actions: PlayOption[] = [];

  // Always can try to mine
  actions.push(PlayOption.MINE);

  // Can buy mining rig if affordable
  if (canAffordMiningRig(gameState, player.walletColor)) {
    actions.push(PlayOption.BUY_MINING_RIG);
  }

  // Can move to cold storage if has bitcoin in hot storage
  const wallet = gameState.wallets.find((w) => w.color === player.walletColor);
  if (wallet && wallet.hotStorage > 0) {
    actions.push(PlayOption.MOVE_TO_COLD_STORAGE);
  }

  // Can move to next block
  actions.push(PlayOption.MOVE_TO_NEXT_BLOCK);

  return actions;
}

/**
 * Check if game is over
 */
export function isGameOver(gameState: GameState): boolean {
  return gameState.gameStatus === 'finished' || gameState.currentBlock > 31;
}

/**
 * Calculate final scores for all players
 */
export function calculateFinalScores(gameState: GameState): { playerId: string; score: number }[] {
  return gameState.players.map((player) => {
    const wallet = gameState.wallets.find((w) => w.color === player.walletColor);

    if (!wallet) {
      return { playerId: player.id, score: 0 };
    }

    // Score = total bitcoin (hot + cold) + bonus for mining rigs
    const totalBitcoin = wallet.hotStorage + wallet.coldStorage;
    const rigBonus = wallet.miningRigs * 2;
    const score = totalBitcoin + rigBonus;

    return { playerId: player.id, score };
  });
}
