// backend/hodlup-game.mjs
// HODLUP Bitcoin Mining Game Logic

export class HodlupGame {
  constructor() {
    this.gameState = {
      timeChain: this.initializeTimeChain(),
      players: new Map(),
      bitcoinTokens: 42, // Total 21M bitcoin (42 tokens x 500k each)
      difficulty: 21,
      currentBlock: 1,
      wallets: this.initializeWallets(),
      miningRigs: 12,
      nonceDecks: this.initializeNonceDecks(),
      isStarted: false,
      currentPlayer: null,
      round: 1
    }
  }

  initializeTimeChain() {
    // 17 time-chain cards in hexagonal sequence
    return Array.from({ length: 17 }, (_, i) => ({
      id: i + 1,
      bitcoinTokens: i === 0 ? 0 : Math.floor(Math.random() * 3) + 1, // Genesis has 0, others 1-3
      isGenesis: i === 0,
      transactions: [],
      hash: null,
      previousHash: i === 0 ? null : 'prev-hash-' + i,
      difficulty: 21,
      nonce: null
    }))
  }

  initializeWallets() {
    // 6 colored wallets
    return {
      red: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null },
      blue: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null },
      green: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null },
      yellow: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null },
      purple: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null },
      orange: { bitcoinTokens: 1, miningRigs: 0, isActive: false, playerId: null }
    }
  }

  initializeNonceDecks() {
    return {
      player: this.createPlayerCards(),
      bitcoin: this.createBitcoinCards(),
      hash: this.createHashCards()
    }
  }

  createPlayerCards() {
    // Create player nonce cards (colored meeples)
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    const cards = []
    
    colors.forEach(color => {
      for (let value = 1; value <= 9; value++) {
        cards.push({
          type: 'player',
          color,
          value,
          id: `player-${color}-${value}`
        })
      }
    })
    
    return this.shuffleDeck(cards)
  }

  createBitcoinCards() {
    // Create bitcoin nonce cards with token values
    const cards = []
    
    for (let i = 1; i <= 42; i++) {
      cards.push({
        type: 'bitcoin',
        value: 3, // Each bitcoin card contributes 3 to transaction sum
        tokens: 1, // Represents 500k bitcoin
        id: `bitcoin-${i}`
      })
    }
    
    return this.shuffleDeck(cards)
  }

  createHashCards() {
    // Create hash nonce cards with unique expressions
    const cards = []
    const expressions = [
      'SHA256', 'RIPEMD160', 'BLAKE2', 'KECCAK', 'SCRYPT',
      'X11', 'LYRA2', 'ARGON2', 'BLAKE3', 'SHA3'
    ]
    
    for (let i = 1; i <= 54; i++) {
      cards.push({
        type: 'hash',
        value: Math.floor(Math.random() * 9) + 1, // 1-9
        expression: expressions[i % expressions.length],
        id: `hash-${i}`
      })
    }
    
    return this.shuffleDeck(cards)
  }

  shuffleDeck(deck) {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  addPlayer(playerId, playerName) {
    // Assign a wallet color to the player
    const availableColors = Object.keys(this.gameState.wallets).filter(
      color => !this.gameState.wallets[color].isActive
    )
    
    if (availableColors.length === 0) {
      throw new Error('Game is full')
    }
    
    const walletColor = availableColors[0]
    this.gameState.wallets[walletColor].isActive = true
    this.gameState.wallets[walletColor].playerId = playerId
    
    // Add mining rigs based on player count
    const playerCount = this.getActivePlayerCount() + 1
    const miningRigsPerPlayer = playerCount <= 5 ? 1 : 2
    this.gameState.wallets[walletColor].miningRigs = miningRigsPerPlayer
    
    const player = {
      id: playerId,
      name: playerName,
      walletColor,
      hand: this.dealInitialHand(),
      bitcoinInColdStorage: 0,
      isReady: false,
      defenseRolls: 0
    }
    
    this.gameState.players.set(playerId, player)
    return player
  }

  dealInitialHand() {
    // Each player gets 4 cards: 2 player, 1 bitcoin, 1 hash
    return {
      player: [
        this.gameState.nonceDecks.player.pop(),
        this.gameState.nonceDecks.player.pop()
      ],
      bitcoin: [this.gameState.nonceDecks.bitcoin.pop()],
      hash: [this.gameState.nonceDecks.hash.pop()]
    }
  }

  getActivePlayerCount() {
    return Object.values(this.gameState.wallets).filter(w => w.isActive).length
  }

  // HODLUP Game Actions
  mineForBitcoin(playerId, selectedCards) {
    const player = this.gameState.players.get(playerId)
    if (!player) throw new Error('Player not found')
    
    // Validate mining attempt
    const transaction = this.createTransaction(selectedCards)
    const isValid = this.validateTransaction(transaction)
    
    if (isValid) {
      // Add new block to time-chain
      const newBlock = this.addBlockToTimeChain(transaction, playerId)
      
      // Update difficulty (make harder)
      this.gameState.difficulty = Math.max(1, this.gameState.difficulty - 1)
      
      // Reward player with bitcoin tokens
      const wallet = this.gameState.wallets[player.walletColor]
      const reward = this.gameState.timeChain[this.gameState.currentBlock - 1].bitcoinTokens
      wallet.bitcoinTokens += reward
      
      // Move to next block
      this.gameState.currentBlock = Math.min(17, this.gameState.currentBlock + 1)
      
      return { success: true, reward, newBlock }
    } else {
      // Failed mining attempt - make difficulty easier
      this.gameState.difficulty = Math.min(21, this.gameState.difficulty + 1)
      return { success: false }
    }
  }

  createTransaction(selectedCards) {
    // Transaction format: player -> bitcoin -> player -> hash
    return {
      sender: selectedCards.player1,
      bitcoin: selectedCards.bitcoin,
      receiver: selectedCards.player2,
      hash: selectedCards.hash,
      total: this.calculateTransactionTotal(selectedCards)
    }
  }

  calculateTransactionTotal(selectedCards) {
    return selectedCards.player1.value + 
           selectedCards.bitcoin.value + 
           selectedCards.player2.value + 
           selectedCards.hash.value
  }

  validateTransaction(transaction) {
    // Mining Validation Criteria (from HODLUP rules):
    // 1. Is the block total less than or equal to the Difficulty Adjustment?
    const criteria1 = transaction.total <= this.gameState.difficulty
    
    // 2. Does the sender have enough bitcoin in hot wallet?
    // (For now, simplified - just check if they have any bitcoin)
    const criteria2 = true // TODO: Implement proper wallet checking
    
    // 3. Does the sender agree to send (no defense roll failure)?
    const criteria3 = true // TODO: Implement defense die mechanics
    
    return criteria1 && criteria2 && criteria3
  }

  addBlockToTimeChain(transaction, minerId) {
    const currentTimeChainCard = this.gameState.timeChain[this.gameState.currentBlock - 1]
    
    const newBlock = {
      id: this.gameState.currentBlock,
      transactions: [transaction],
      minedBy: minerId,
      timestamp: Date.now(),
      hash: this.generateBlockHash(transaction),
      previousHash: this.gameState.currentBlock > 1 ? 
        this.gameState.timeChain[this.gameState.currentBlock - 2].hash : null,
      bitcoinReward: currentTimeChainCard.bitcoinTokens
    }
    
    // Place cards on time-chain (stacked on current card)
    currentTimeChainCard.transactions.push(transaction)
    currentTimeChainCard.hash = newBlock.hash
    
    return newBlock
  }

  generateBlockHash(transaction) {
    // Simple hash generation for demo
    return 'hash-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  addMiningRig(playerId) {
    const player = this.gameState.players.get(playerId)
    if (!player) throw new Error('Player not found')
    
    const wallet = this.gameState.wallets[player.walletColor]
    
    // Cost: 1 bitcoin token
    if (wallet.bitcoinTokens >= 1) {
      wallet.bitcoinTokens -= 1
      wallet.miningRigs += 1
      
      // Move bitcoin to unassigned wallet
      const unassignedWallets = Object.values(this.gameState.wallets).filter(w => !w.isActive)
      if (unassignedWallets.length > 0) {
        unassignedWallets[0].bitcoinTokens += 1
      }
      
      return { success: true, newRigCount: wallet.miningRigs }
    }
    
    return { success: false, error: 'Not enough bitcoin tokens' }
  }

  moveToColdStorage(playerId, amount) {
    const player = this.gameState.players.get(playerId)
    if (!player) throw new Error('Player not found')
    
    const wallet = this.gameState.wallets[player.walletColor]
    
    if (wallet.bitcoinTokens >= amount) {
      wallet.bitcoinTokens -= amount
      player.bitcoinInColdStorage += amount
      return { success: true }
    }
    
    return { success: false, error: 'Not enough bitcoin in hot wallet' }
  }

  drawCards(playerId) {
    const player = this.gameState.players.get(playerId)
    if (!player) throw new Error('Player not found')
    
    const wallet = this.gameState.wallets[player.walletColor]
    const cardsCanDraw = wallet.miningRigs // Can draw 1 card per mining rig
    
    const drawnCards = {
      player: [],
      bitcoin: [],
      hash: []
    }
    
    // Draw cards (2 player, 1 bitcoin, 1 hash per mining rig)
    for (let i = 0; i < cardsCanDraw; i++) {
      if (this.gameState.nonceDecks.player.length > 0) {
        drawnCards.player.push(this.gameState.nonceDecks.player.pop())
      }
      if (this.gameState.nonceDecks.player.length > 0) {
        drawnCards.player.push(this.gameState.nonceDecks.player.pop())
      }
      if (this.gameState.nonceDecks.bitcoin.length > 0) {
        drawnCards.bitcoin.push(this.gameState.nonceDecks.bitcoin.pop())
      }
      if (this.gameState.nonceDecks.hash.length > 0) {
        drawnCards.hash.push(this.gameState.nonceDecks.hash.pop())
      }
    }
    
    // Add to player's hand
    player.hand.player.push(...drawnCards.player)
    player.hand.bitcoin.push(...drawnCards.bitcoin)
    player.hand.hash.push(...drawnCards.hash)
    
    return drawnCards
  }

  getGameState() {
    return {
      ...this.gameState,
      players: Array.from(this.gameState.players.values()).map(player => ({
        ...player,
        hand: {
          player: player.hand.player.length,
          bitcoin: player.hand.bitcoin.length,
          hash: player.hand.hash.length
        } // Hide actual cards from other players
      }))
    }
  }

  getPlayerPrivateState(playerId) {
    const player = this.gameState.players.get(playerId)
    if (!player) return null
    
    return {
      ...this.getGameState(),
      privateHand: player.hand // Show actual cards to the player
    }
  }
}
