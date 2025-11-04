// peardrive/ChatManager.js - P2P Chat System

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

class ChatManager extends SimpleEventEmitter {
    constructor(p2pManager, turnManager) {
        super();
        this.p2p = p2pManager;
        this.turnManager = turnManager;
        this.messages = [];
        this.maxMessages = 100;
        this.localPlayerId = null;
        this.playerNames = new Map();

        // Listen to P2P messages
        this.p2p.on('message', this.handleP2PMessage.bind(this));

        // Listen to turn events for contextual messages
        this.turnManager.on('turn_started', this.onTurnStarted.bind(this));
        this.turnManager.on('move_made', this.onMoveMade.bind(this));
        this.turnManager.on('game_started', this.onGameStarted.bind(this));
        this.turnManager.on('game_ended', this.onGameEnded.bind(this));
    }

    initialize(localPlayerId) {
        this.localPlayerId = localPlayerId;
        console.log('💬 Chat system initialized for player:', localPlayerId);
    }

    // ========== CHAT MESSAGING ==========
    async sendMessage(text, messageType = 'player') {
        if (!text || !text.trim()) {
            return false;
        }

        const message = {
            id: this.generateMessageId(),
            senderId: this.localPlayerId,
            senderName: this.getPlayerName(this.localPlayerId),
            text: text.trim(),
            type: messageType, // 'player', 'system', 'game_event'
            timestamp: new Date().toISOString(),
            gameContext: this.getGameContext()
        };

        // Add to local messages
        this.addMessage(message);

        // Broadcast to other players
        this.p2p.broadcastMessage({
            type: 'chat_message',
            data: message
        });

        console.log(`💬 [${message.senderName}]: ${message.text}`);
        return true;
    }

    addMessage(message) {
        this.messages.push(message);

        // Keep only recent messages
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        this.emit('message_received', message);
    }

    // ========== SYSTEM MESSAGES ==========
    addSystemMessage(text, context = {}) {
        const message = {
            id: this.generateMessageId(),
            senderId: 'system',
            senderName: 'System',
            text,
            type: 'system',
            timestamp: new Date().toISOString(),
            gameContext: { ...this.getGameContext(), ...context }
        };

        this.addMessage(message);
        return message;
    }

    addGameEventMessage(text, playerId = null, context = {}) {
        const playerName = playerId ? this.getPlayerName(playerId) : null;
        const message = {
            id: this.generateMessageId(),
            senderId: playerId || 'game',
            senderName: playerName || 'Game',
            text,
            type: 'game_event',
            timestamp: new Date().toISOString(),
            gameContext: { ...this.getGameContext(), ...context }
        };

        this.addMessage(message);

        // Broadcast game events to other players
        this.p2p.broadcastMessage({
            type: 'chat_message',
            data: message
        });

        return message;
    }

    // ========== QUICK MESSAGES ==========
    sendQuickMessage(messageKey) {
        const quickMessages = {
            'hodl': 'HODL to the moon! 🚀',
            'buy_dip': 'Buying the dip!',
            'diamond_hands': 'Diamond hands! 💎🙌',
            'paper_hands': 'Paper hands detected...',
            'good_move': 'Nice move!',
            'risky': 'That\'s risky!',
            'safe_play': 'Playing it safe',
            'gg': 'Good game!',
            'lucky': 'Lucky!',
            'unlucky': 'Unlucky...'
        };

        const text = quickMessages[messageKey];
        if (text) {
            this.sendMessage(text, 'player');
        }
    }

    // ========== GAME EVENT HANDLERS ==========
    onTurnStarted(data) {
        const playerName = this.getPlayerName(data.player.id);
        this.addSystemMessage(`It's ${playerName}'s turn`, {
            currentPlayer: data.player.id,
            round: this.turnManager.gameState.round
        });
    }

    onMoveMade(data) {
        const playerName = this.getPlayerName(data.peerId);
        const action = data.moveData.action;

        let actionText = '';
        switch (action) {
            case 'buy':
                actionText = `${playerName} bought Bitcoin for ${data.moveData.amount}`;
                break;
            case 'sell':
                actionText = `${playerName} sold ${data.moveData.amount} Bitcoin`;
                break;
            case 'move_to_cold':
                actionText = `${playerName} moved ${data.moveData.amount} Bitcoin to cold storage`;
                break;
            case 'move_to_hot':
                actionText = `${playerName} moved ${data.moveData.amount} Bitcoin to hot wallet`;
                break;
            case 'pass':
                actionText = `${playerName} passed their turn`;
                break;
            default:
                actionText = `${playerName} made a move`;
        }

        this.addGameEventMessage(actionText, data.peerId, {
            action: action,
            amount: data.moveData.amount
        });
    }

    onGameStarted(data) {
        this.addSystemMessage('Game started! Good luck everyone!', {
            totalPlayers: data.players.length
        });
    }

    onGameEnded(data) {
        const winnerText = data.winner
            ? `Game over! ${data.winner.name} wins!`
            : 'Game over!';

        this.addSystemMessage(winnerText, {
            winner: data.winner,
            standings: data.standings
        });
    }

    // ========== PLAYER MANAGEMENT ==========
    updatePlayerName(playerId, name) {
        this.playerNames.set(playerId, name);
    }

    getPlayerName(playerId) {
        if (playerId === this.localPlayerId) {
            return 'You';
        }

        if (playerId === 'system' || playerId === 'game') {
            return 'System';
        }

        return this.playerNames.get(playerId) || `Player ${playerId.slice(-4)}`;
    }

    // ========== UTILITIES ==========
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    getGameContext() {
        return {
            round: this.turnManager?.gameState?.round || 0,
            currentPlayer: this.turnManager?.getCurrentPlayer()?.id || null,
            gameStatus: this.turnManager?.gameState?.gameStatus || 'unknown'
        };
    }

    getMessages() {
        return [...this.messages];
    }

    getRecentMessages(count = 20) {
        return this.messages.slice(-count);
    }

    clearMessages() {
        this.messages = [];
        this.emit('messages_cleared');
    }

    // ========== P2P MESSAGE HANDLING ==========
    handleP2PMessage(message) {
        if (message.type === 'chat_message') {
            // Don't add our own messages again
            if (message.data.senderId !== this.localPlayerId) {
                this.addMessage(message.data);
            }
        }
    }

    // ========== CHAT COMMANDS ==========
    handleChatCommand(text) {
        if (!text.startsWith('/')) {
            return false;
        }

        const [command, ...args] = text.slice(1).split(' ');

        switch (command.toLowerCase()) {
            case 'help':
                this.showHelp();
                break;
            case 'players':
                this.listPlayers();
                break;
            case 'status':
                this.showGameStatus();
                break;
            case 'clear':
                this.clearMessages();
                break;
            default:
                this.addSystemMessage(`Unknown command: /${command}. Type /help for available commands.`);
        }

        return true;
    }

    showHelp() {
        const commands = [
            '/help - Show this help message',
            '/players - List all players',
            '/status - Show game status',
            '/clear - Clear chat messages'
        ];

        this.addSystemMessage('Available commands:\n' + commands.join('\n'));
    }

    listPlayers() {
        const players = Array.from(this.turnManager.gameState.players.values());
        const playerList = players.map(p => `${p.name} (${p.isReady ? 'Ready' : 'Not Ready'})`).join('\n');

        this.addSystemMessage(`Players (${players.length}):\n${playerList}`);
    }

    showGameStatus() {
        const gameState = this.turnManager.gameState;
        const currentPlayer = this.turnManager.getCurrentPlayer();

        const status = [
            `Game Status: ${gameState.gameStatus}`,
            `Round: ${gameState.round}/${gameState.maxRounds}`,
            `Current Turn: ${currentPlayer ? currentPlayer.name : 'None'}`,
            `Players: ${gameState.players.size}`
        ];

        this.addSystemMessage(status.join('\n'));
    }

    // ========== CHAT FILTERS & MODERATION ==========
    filterMessage(text) {
        // Basic profanity filter (expand as needed)
        const blockedWords = ['spam', 'cheat']; // Add more as needed
        let filtered = text;

        blockedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });

        return filtered;
    }

    // ========== EXPORT CHAT LOG ==========
    exportChatLog() {
        const log = this.messages.map(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            return `[${date}] ${msg.senderName}: ${msg.text}`;
        }).join('\n');

        return log;
    }
}

export default ChatManager;