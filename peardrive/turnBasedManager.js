// peardrive/TurnManager.js - HODL UP Turn-Based Game Management

// Simple EventEmitter for React Native
class SimpleEventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }

    off(event, listener) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(l => l !== listener);
        }
    }
}

class TurnManager extends SimpleEventEmitter {
    constructor(p2pManager) {
        super();
        this.p2p = p2pManager;
        this.gameState = {
            players: new Map(),
            playerOrder: [],
            currentTurnIndex: 0,
            gameStatus: 'waiting', // waiting, playing, finished
            round: 1,
            maxRounds: 5,
            turnTimeLimit: 30000, // 30 seconds per turn
            gameCode: null
        };

        this.turnTimer = null;
        this.isHost = false;

        // Listen to P2P messages
        this.p2p.on('message', this.handleP2PMessage.bind(this));
    }

    // ========== GAME SETUP ==========
    async initializeGame(isHost, gameCode = null) {
        this.isHost = isHost;
        this.gameState.gameCode = gameCode;

        if (isHost) {
            console.log('🎮 Initializing as game host...');
            this.gameState.gameStatus = 'waiting';
        } else {
            console.log('🚪 Initializing as player...');
        }

        this.emit('game_initialized', {
            isHost: this.isHost,
            gameCode: this.gameState.gameCode
        });
    }

    addPlayer(peerId, playerData) {
        if (this.gameState.players.has(peerId)) {
            console.log('Player already exists:', peerId);
            return;
        }

        const player = {
            id: peerId,
            name: playerData.name || `Player ${this.gameState.players.size + 1}`,
            isHost: playerData.isHost || false,
            isReady: false,
            joinedAt: Date.now(),
            // HODL UP specific player state
            position: 0,
            bitcoinHot: 0,
            bitcoinCold: 0,
            cashBalance: 10000, // Starting cash
            securityStatus: 'safe', // safe, unsafe
            lastAction: null
        };

        this.gameState.players.set(peerId, player);
        this.gameState.playerOrder.push(peerId);

        console.log(`👤 Player added: ${player.name} (${peerId})`);

        // Broadcast player joined
        if (this.isHost) {
            this.broadcastGameState();
        }

        this.emit('player_added', player);
    }

    removePlayer(peerId) {
        if (!this.gameState.players.has(peerId)) return;

        const player = this.gameState.players.get(peerId);
        this.gameState.players.delete(peerId);

        // Remove from turn order
        const index = this.gameState.playerOrder.indexOf(peerId);
        if (index > -1) {
            this.gameState.playerOrder.splice(index, 1);

            // Adjust current turn index if needed
            if (this.gameState.currentTurnIndex >= index && this.gameState.currentTurnIndex > 0) {
                this.gameState.currentTurnIndex--;
            }
        }

        console.log(`👋 Player removed: ${player.name}`);

        if (this.isHost) {
            this.broadcastGameState();
        }

        this.emit('player_removed', player);
    }

    setPlayerReady(peerId, isReady = true) {
        const player = this.gameState.players.get(peerId);
        if (!player) return false;

        player.isReady = isReady;

        console.log(`✅ Player ${player.name} is ${isReady ? 'ready' : 'not ready'}`);

        if (this.isHost) {
            this.broadcastGameState();
            this.checkIfCanStart();
        }

        this.emit('player_ready_changed', { peerId, isReady });
        return true;
    }

    checkIfCanStart() {
        if (!this.isHost || this.gameState.gameStatus !== 'waiting') return;

        const players = Array.from(this.gameState.players.values());
        const minPlayers = 2;
        const maxPlayers = 4;

        if (players.length < minPlayers) {
            console.log(`🚫 Need at least ${minPlayers} players to start`);
            return;
        }

        if (players.length > maxPlayers) {
            console.log(`🚫 Maximum ${maxPlayers} players allowed`);
            return;
        }

        const allReady = players.every(player => player.isReady);

        if (allReady) {
            console.log('🚀 All players ready - starting game!');
            this.startGame();
        }
    }

    // ========== GAME FLOW ==========
    startGame() {
        if (!this.isHost) {
            console.log('❌ Only host can start the game');
            return;
        }

        this.gameState.gameStatus = 'playing';
        this.gameState.round = 1;
        this.gameState.currentTurnIndex = 0;

        // Shuffle player order
        this.shufflePlayerOrder();

        console.log('🎮 Game started!');
        console.log('📋 Player order:', this.getPlayerNames());

        this.broadcastMessage({
            type: 'game_started',
            data: {
                gameState: this.getPublicGameState(),
                firstPlayer: this.getCurrentPlayer()
            }
        });

        this.startTurn();
        this.emit('game_started', this.getPublicGameState());
    }

    startTurn() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
        }

        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) {
            console.log('❌ No current player found');
            return;
        }

        console.log(`🎯 Turn ${this.gameState.round}: ${currentPlayer.name}'s turn`);

        // Set turn timer
        this.turnTimer = setTimeout(() => {
            console.log('⏰ Turn timeout - auto-advancing');
            this.nextTurn();
        }, this.gameState.turnTimeLimit);

        this.broadcastMessage({
            type: 'turn_started',
            data: {
                currentPlayer: currentPlayer.id,
                timeLimit: this.gameState.turnTimeLimit,
                round: this.gameState.round
            }
        });

        this.emit('turn_started', {
            player: currentPlayer,
            timeRemaining: this.gameState.turnTimeLimit
        });
    }

    makeMove(peerId, moveData) {
        // Validate it's the player's turn
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== peerId) {
            console.log('❌ Not your turn:', peerId);
            return false;
        }

        // Validate move based on HODL UP rules
        if (!this.validateMove(peerId, moveData)) {
            console.log('❌ Invalid move:', moveData);
            return false;
        }

        console.log(`🎯 Move made by ${currentPlayer.name}:`, moveData);

        // Process the move
        this.processMove(peerId, moveData);

        // Broadcast the move
        this.broadcastMessage({
            type: 'move_made',
            data: {
                playerId: peerId,
                move: moveData,
                gameState: this.getPublicGameState()
            }
        });

        this.emit('move_made', { peerId, moveData });

        // Advance to next turn
        setTimeout(() => {
            this.nextTurn();
        }, 1000);

        return true;
    }

    validateMove(peerId, moveData) {
        const player = this.gameState.players.get(peerId);
        if (!player) return false;

        // Basic HODL UP move validation
        switch (moveData.action) {
            case 'buy':
                return player.cashBalance >= moveData.amount;
            case 'sell':
                return player.bitcoinHot >= moveData.amount;
            case 'move_to_cold':
                return player.bitcoinHot >= moveData.amount;
            case 'move_to_hot':
                return player.bitcoinCold >= moveData.amount;
            case 'pass':
                return true;
            default:
                return false;
        }
    }

    processMove(peerId, moveData) {
        const player = this.gameState.players.get(peerId);
        if (!player) return;

        player.lastAction = moveData;

        // Process HODL UP actions
        switch (moveData.action) {
            case 'buy':
                player.cashBalance -= moveData.amount;
                player.bitcoinHot += moveData.amount / 50000; // Mock Bitcoin price
                break;
            case 'sell':
                player.bitcoinHot -= moveData.amount;
                player.cashBalance += moveData.amount * 50000;
                break;
            case 'move_to_cold':
                player.bitcoinHot -= moveData.amount;
                player.bitcoinCold += moveData.amount;
                player.securityStatus = 'safe';
                break;
            case 'move_to_hot':
                player.bitcoinCold -= moveData.amount;
                player.bitcoinHot += moveData.amount;
                player.securityStatus = 'unsafe';
                break;
        }

        console.log(`💰 Player ${player.name} balance:`, {
            cash: player.cashBalance,
            hotBTC: player.bitcoinHot,
            coldBTC: player.bitcoinCold
        });
    }

    nextTurn() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }

        // Check if round is complete
        if (this.gameState.currentTurnIndex >= this.gameState.playerOrder.length - 1) {
            this.endRound();
            return;
        }

        // Advance to next player
        this.gameState.currentTurnIndex++;
        this.startTurn();
    }

    endRound() {
        console.log(`🏁 Round ${this.gameState.round} complete`);

        // Check if game is over
        if (this.gameState.round >= this.gameState.maxRounds) {
            this.endGame();
            return;
        }

        // Start next round
        this.gameState.round++;
        this.gameState.currentTurnIndex = 0;

        this.broadcastMessage({
            type: 'round_ended',
            data: {
                round: this.gameState.round - 1,
                nextRound: this.gameState.round,
                gameState: this.getPublicGameState()
            }
        });

        // Brief pause before next round
        setTimeout(() => {
            this.startTurn();
        }, 2000);

        this.emit('round_ended', { round: this.gameState.round });
    }

    endGame() {
        this.gameState.gameStatus = 'finished';

        // Calculate winner
        const winner = this.calculateWinner();

        console.log('🏆 Game Over! Winner:', winner?.name);

        this.broadcastMessage({
            type: 'game_ended',
            data: {
                winner,
                finalStandings: this.getFinalStandings(),
                gameState: this.getPublicGameState()
            }
        });

        this.emit('game_ended', { winner, standings: this.getFinalStandings() });
    }

    // ========== UTILITIES ==========
    getCurrentPlayer() {
        const playerId = this.gameState.playerOrder[this.gameState.currentTurnIndex];
        return this.gameState.players.get(playerId);
    }

    shufflePlayerOrder() {
        for (let i = this.gameState.playerOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameState.playerOrder[i], this.gameState.playerOrder[j]] =
                [this.gameState.playerOrder[j], this.gameState.playerOrder[i]];
        }
    }

    getPlayerNames() {
        return this.gameState.playerOrder.map(id => {
            const player = this.gameState.players.get(id);
            return player ? player.name : 'Unknown';
        });
    }

    calculateWinner() {
        const players = Array.from(this.gameState.players.values());
        return players.reduce((winner, player) => {
            const totalValue = player.cashBalance +
                (player.bitcoinHot + player.bitcoinCold) * 50000;
            const winnerValue = winner.cashBalance +
                (winner.bitcoinHot + winner.bitcoinCold) * 50000;

            return totalValue > winnerValue ? player : winner;
        });
    }

    getFinalStandings() {
        return Array.from(this.gameState.players.values())
            .map(player => ({
                name: player.name,
                totalValue: player.cashBalance + (player.bitcoinHot + player.bitcoinCold) * 50000,
                bitcoin: player.bitcoinHot + player.bitcoinCold,
                cash: player.cashBalance
            }))
            .sort((a, b) => b.totalValue - a.totalValue);
    }

    getPublicGameState() {
        return {
            players: Array.from(this.gameState.players.values()),
            currentTurnIndex: this.gameState.currentTurnIndex,
            gameStatus: this.gameState.gameStatus,
            round: this.gameState.round,
            maxRounds: this.gameState.maxRounds,
            gameCode: this.gameState.gameCode
        };
    }

    // ========== P2P MESSAGE HANDLING ==========
    handleP2PMessage(message) {
        switch (message.type) {
            case 'player_joined':
                if (message.data.peerId !== this.p2p.localPeerId) {
                    this.addPlayer(message.data.peerId, message.data.playerData);
                }
                break;
            case 'player_ready':
                this.setPlayerReady(message.data.peerId, message.data.isReady);
                break;
            case 'make_move':
                this.makeMove(message.data.peerId, message.data.move);
                break;
            case 'game_state_sync':
                if (!this.isHost) {
                    this.syncGameState(message.data);
                }
                break;
        }
    }

    broadcastMessage(message) {
        this.p2p.broadcastMessage(message);
    }

    broadcastGameState() {
        this.broadcastMessage({
            type: 'game_state_sync',
            data: this.getPublicGameState()
        });
    }

    syncGameState(newState) {
        // Update local game state from host
        this.gameState = { ...this.gameState, ...newState };
        this.emit('game_state_updated', newState);
    }
}

export default TurnManager;