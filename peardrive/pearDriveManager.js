// peardrive/P2PManager.js - Real PearDrive P2P Networking
// Note: Actual import will depend on PearDrive structure
// import { PearDrive } from '@peardrive/core';
// @peardrive/core v2.0.0 is currently Node.js only and doesn't support React Native
// Keeping mock implementation until React Native support is added

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

class P2PManager extends SimpleEventEmitter {
    constructor() {
        super();
        this.peardrive = null;
        this.connections = new Map();
        this.isInitialized = false;
        this.localPeerId = null;
        this.gameCode = null;
        this.isHost = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing PearDrive P2P...');

            // TODO: Replace with actual PearDrive initialization when RN support is added
            // this.peardrive = new PearDrive();
            // await this.peardrive.ready();

            // For now, simulate initialization
            this.isInitialized = true;
            this.localPeerId = this.generatePeerId();

            console.log('✅ P2P initialized, Peer ID:', this.localPeerId);
            this.emit('initialized', { peerId: this.localPeerId });

            return this.localPeerId;
        } catch (error) {
            console.error('❌ P2P initialization failed:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async createGame() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            this.isHost = true;
            this.gameCode = this.generateGameCode();

            console.log('🎮 Creating P2P game room...');
            console.log('📋 Game Code:', this.gameCode);

            // TODO: Create PearDrive swarm/room
            // const topic = Buffer.from(this.gameCode);
            // await this.peardrive.join(topic, { server: true, client: false });

            // Set up connection handlers
            this.setupConnectionHandlers();

            this.emit('game_created', {
                gameCode: this.gameCode,
                peerId: this.localPeerId,
                isHost: true
            });

            return this.gameCode;
        } catch (error) {
            console.error('❌ Failed to create game:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async joinGame(gameCode) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            this.isHost = false;
            this.gameCode = gameCode;

            console.log('🚪 Joining P2P game:', gameCode);

            // TODO: Join PearDrive swarm/room
            // const topic = Buffer.from(gameCode);
            // await this.peardrive.join(topic, { server: false, client: true });

            // Set up connection handlers
            this.setupConnectionHandlers();

            this.emit('game_joined', {
                gameCode: this.gameCode,
                peerId: this.localPeerId,
                isHost: false
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to join game:', error);
            this.emit('error', error);
            throw error;
        }
    }

    setupConnectionHandlers() {
        // TODO: Set up actual PearDrive connection handlers
        /*
        this.peardrive.on('connection', (connection) => {
          console.log('🔗 Peer connected:', connection.peerId);

          this.connections.set(connection.peerId, connection);

          connection.on('data', (data) => {
            this.handleIncomingMessage(data, connection.peerId);
          });

          connection.on('close', () => {
            console.log('👋 Peer disconnected:', connection.peerId);
            this.connections.delete(connection.peerId);
            this.emit('peer_disconnected', { peerId: connection.peerId });
          });

          this.emit('peer_connected', {
            peerId: connection.peerId,
            totalPeers: this.connections.size
          });
        });
        */

        // Mock connection for testing
        setTimeout(() => {
            this.emit('peer_connected', {
                peerId: 'mock_peer_123',
                totalPeers: 1
            });
        }, 2000);
    }

    broadcastMessage(message) {
        const messageStr = JSON.stringify({
            ...message,
            senderId: this.localPeerId,
            timestamp: Date.now()
        });

        console.log('📡 Broadcasting message:', message.type);

        // TODO: Send to all connections
        /*
        for (const [peerId, connection] of this.connections) {
          try {
            connection.write(messageStr);
          } catch (error) {
            console.error('Failed to send to peer:', peerId, error);
          }
        }
        */

        // Mock broadcast for testing
        setTimeout(() => {
            this.handleIncomingMessage({
                ...message,
                senderId: 'mock_peer_123',
                timestamp: Date.now()
            }, 'mock_peer_123');
        }, 500);
    }

    sendToPeer(peerId, message) {
        const connection = this.connections.get(peerId);
        if (!connection) {
            console.error('Peer not found:', peerId);
            return false;
        }

        const messageStr = JSON.stringify({
            ...message,
            senderId: this.localPeerId,
            timestamp: Date.now()
        });

        try {
            // TODO: Send to specific peer
            // connection.write(messageStr);
            console.log('📤 Sent message to peer:', peerId, message.type);
            return true;
        } catch (error) {
            console.error('Failed to send to peer:', peerId, error);
            return false;
        }
    }

    handleIncomingMessage(messageData, fromPeerId) {
        try {
            const message = typeof messageData === 'string'
                ? JSON.parse(messageData)
                : messageData;

            console.log('📥 Received message:', message.type, 'from:', fromPeerId);

            // Emit the message for other components to handle
            this.emit('message', {
                ...message,
                fromPeerId
            });

        } catch (error) {
            console.error('Failed to parse incoming message:', error);
        }
    }

    generatePeerId() {
        return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    generateGameCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'HODL-';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    getConnectedPeers() {
        return Array.from(this.connections.keys());
    }

    getPeerCount() {
        return this.connections.size;
    }

    async disconnect() {
        console.log('👋 Disconnecting from P2P network...');

        try {
            // TODO: Close PearDrive connections
            // if (this.peardrive) {
            //   await this.peardrive.close();
            // }

            this.connections.clear();
            this.isInitialized = false;
            this.gameCode = null;
            this.isHost = false;

            this.emit('disconnected');
        } catch (error) {
            console.error('Error during disconnect:', error);
        }
    }
}

export default P2PManager;
