// backend/backend.mjs
/* global Bare, BareKit */

import RPC from 'bare-rpc'
import fs from 'bare-fs'
import URL from 'bare-url'
import { join } from 'bare-path'
import crypto from 'bare-crypto'

// Import PearDrive for P2P networking
import PearDrive from '@hopets/peardrive-core'

// Import HODLUP game logic
import { HodlupGame } from './hodlup-game.mjs'

// Import RPC commands
import {
  RPC_CREATE_GAME,
  RPC_JOIN_GAME,
  RPC_LEAVE_GAME,
  RPC_GAME_CREATED,
  RPC_GAME_JOINED,
  RPC_GAME_ERROR,
  RPC_PLAYER_JOINED,
  RPC_PLAYER_LEFT,
  RPC_GAME_STATE_UPDATE,
  RPC_CONNECTION_STATUS,
  RPC_HODLUP_MINE_FOR_BITCOIN,
  RPC_HODLUP_ADD_MINING_RIG,
  RPC_HODLUP_MOVE_TO_COLD_STORAGE,
  RPC_HODLUP_DRAW_NONCE_CARDS,
  RPC_HODLUP_TIME_CHAIN_UPDATE,
  RPC_HODLUP_WALLET_UPDATE
} from '../rpc-commands.mjs'

const { IPC } = BareKit

// Setup storage path
const storagePath = join(URL.fileURLToPath(Bare.argv[0]), 'holdup-casino')

// Initialize RPC
const rpc = new RPC(IPC, handleUIRequest)

// Game session state
let gameSession = {
  id: null,
  type: null,
  isHost: false,
  gameKey: null,
  hodlupGame: null,
  peerDrive: null,
  connections: new Map(),
  localPlayerId: generatePlayerId(),
  localPlayerName: 'Player' + Math.floor(Math.random() * 1000)
}

function generatePlayerId() {
  return crypto.randomBytes(16).toString('hex')
}

function generateGameKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function handleUIRequest(req) {
  console.log('Backend received command:', req.command)
  
  try {
    switch (req.command) {
      case RPC_CREATE_GAME:
        await handleCreateGame(req)
        break
        
      case RPC_JOIN_GAME:
        await handleJoinGame(req)
        break
        
      case RPC_LEAVE_GAME:
        await handleLeaveGame(req)
        break
        
      case RPC_HODLUP_MINE_FOR_BITCOIN:
        await handleHodlupMineForBitcoin(req)
        break
        
      case RPC_HODLUP_ADD_MINING_RIG:
        await handleHodlupAddMiningRig(req)
        break
        
      case RPC_HODLUP_MOVE_TO_COLD_STORAGE:
        await handleHodlupMoveToColdStorage(req)
        break
        
      case RPC_HODLUP_DRAW_NONCE_CARDS:
        await handleHodlupDrawCards(req)
        break
        
      default:
        console.log('Unknown command from UI:', req.command)
    }
  } catch (error) {
    console.error('Error handling request:', error)
    sendToUI(RPC_GAME_ERROR, { message: error.message })
  }
}

async function handleCreateGame(req) {
  const config = JSON.parse(req.data.toString())
  console.log('Creating HODLUP game with config:', config)
  
  // Initialize HODLUP game
  gameSession.hodlupGame = new HodlupGame()
  gameSession.id = generatePlayerId()
  gameSession.type = config.gameType
  gameSession.isHost = true
  gameSession.gameKey = generateGameKey()
  
  // Add local player to game
  const localPlayer = gameSession.hodlupGame.addPlayer(
    gameSession.localPlayerId, 
    gameSession.localPlayerName
  )
  
  // Initialize P2P networking with PearDrive
  try {
    gameSession.peerDrive = new PearDrive({
      storage: storagePath + '/host-' + gameSession.gameKey
    })
    
    await gameSession.peerDrive.ready()
    console.log('PearDrive initialized for HODLUP host')
    
    // Create a discovery key for the game
    const gameDiscoveryKey = crypto.createHash('sha256')
      .update('hodlup-game-' + gameSession.gameKey)
      .digest('hex')
    
    // Set up P2P event handlers for multiplayer
    setupP2PEventHandlers()
    
  } catch (error) {
    console.error('Failed to initialize PearDrive:', error)
    sendToUI(RPC_GAME_ERROR, { message: 'Failed to initialize P2P networking' })
    return
  }
  
  // Send success response to UI
  sendToUI(RPC_GAME_CREATED, {
    gameId: gameSession.id,
    gameKey: gameSession.gameKey,
    gameType: gameSession.type,
    localPlayer: localPlayer,
    walletColor: localPlayer.walletColor
  })
  
  // Send initial game state
  sendHodlupGameStateUpdate()
}

async function handleJoinGame(req) {
  const { gameKey } = JSON.parse(req.data.toString())
  console.log('Joining HODLUP game with key:', gameKey)
  
  try {
    // Initialize PearDrive to connect to the host
    gameSession.peerDrive = new PearDrive({
      storage: storagePath + '/client-' + gameKey
    })
    
    await gameSession.peerDrive.ready()
    
    gameSession.gameKey = gameKey
    gameSession.isHost = false
    gameSession.type = 'hodlup'
    
    // Set up P2P connection to host
    const gameDiscoveryKey = crypto.createHash('sha256')
      .update('hodlup-game-' + gameKey)
      .digest('hex')
    
    // TODO: Use PearDrive to discover and connect to host
    // For now, simulate connection
    setupP2PEventHandlers()
    
    // Send join request
    const joinMessage = {
      type: 'JOIN_REQUEST',
      playerId: gameSession.localPlayerId,
      playerName: gameSession.localPlayerName,
      timestamp: Date.now()
    }
    
    // TODO: Send via PearDrive
    console.log('Sending join request:', joinMessage)
    
    // Simulate successful connection
    setTimeout(() => {
      sendToUI(RPC_GAME_JOINED, {
        gameId: gameKey,
        gameType: 'hodlup',
        gameKey: gameKey
      })
    }, 1000)
    
  } catch (error) {
    console.error('Failed to join HODLUP game:', error)
    sendToUI(RPC_GAME_ERROR, { message: 'Failed to join game: ' + error.message })
  }
}

function setupP2PEventHandlers() {
  if (!gameSession.peerDrive) return
  
  // Handle incoming P2P messages
  gameSession.peerDrive.on('message', (message, peer) => {
    try {
      const data = JSON.parse(message.toString())
      handleP2PMessage(data, peer)
    } catch (error) {
      console.error('Error parsing P2P message:', error)
    }
  })
  
  // Handle peer connections
  gameSession.peerDrive.on('peer-add', (peer) => {
    console.log('New peer connected:', peer.id)
    gameSession.connections.set(peer.id, peer)
    
    // Send current game state to new peer
    if (gameSession.isHost && gameSession.hodlupGame) {
      const gameState = gameSession.hodlupGame.getGameState()
      peer.send(JSON.stringify({
        type: 'GAME_STATE_UPDATE',
        gameState
      }))
    }
  })
  
  gameSession.peerDrive.on('peer-remove', (peer) => {
    console.log('Peer disconnected:', peer.id)
    gameSession.connections.delete(peer.id)
    
    if (gameSession.hodlupGame) {
      // Handle player leaving
      const players = Array.from(gameSession.hodlupGame.gameState.players.values())
      const leavingPlayer = players.find(p => p.id === peer.id)
      
      if (leavingPlayer) {
        gameSession.hodlupGame.gameState.players.delete(peer.id)
        broadcastToPlayers('PLAYER_LEFT', { playerId: peer.id, playerName: leavingPlayer.name })
        sendHodlupGameStateUpdate()
      }
    }
  })
}

function handleP2PMessage(data, peer) {
  console.log('Received P2P message:', data.type, 'from:', peer.id)
  
  switch (data.type) {
    case 'JOIN_REQUEST':
      if (gameSession.isHost && gameSession.hodlupGame) {
        try {
          // Add player to game
          const newPlayer = gameSession.hodlupGame.addPlayer(data.playerId, data.playerName)
          
          // Send success response
          peer.send(JSON.stringify({
            type: 'JOIN_ACCEPTED',
            player: newPlayer,
            gameState: gameSession.hodlupGame.getGameState()
          }))
          
          // Notify other players
          broadcastToPlayers('PLAYER_JOINED', { player: newPlayer })
          sendHodlupGameStateUpdate()
          
        } catch (error) {
          peer.send(JSON.stringify({
            type: 'JOIN_REJECTED',
            reason: error.message
          }))
        }
      }
      break
      
    case 'JOIN_ACCEPTED':
      // Successfully joined game
      gameSession.localPlayer = data.player
      sendToUI(RPC_GAME_JOINED, {
        gameId: gameSession.gameKey,
        gameType: 'hodlup',
        localPlayer: data.player,
        gameState: data.gameState
      })
      break
      
    case 'MINING_RESULT':
      // Another player mined a block
      if (gameSession.hodlupGame) {
        sendToUI(RPC_HODLUP_TIME_CHAIN_UPDATE, data.result)
        sendHodlupGameStateUpdate()
      }
      break
      
    case 'MINING_RIG_ADDED':
      // Another player added a mining rig
      sendToUI(RPC_HODLUP_WALLET_UPDATE, data.result)
      sendHodlupGameStateUpdate()
      break
      
    case 'GAME_STATE_UPDATE':
      // Received game state update
      sendToUI(RPC_GAME_STATE_UPDATE, { gameState: data.gameState })
      break
      
    default:
      console.log('Unknown P2P message type:', data.type)
  }
}

async function handleHodlupMineForBitcoin(req) {
  const { selectedCards } = JSON.parse(req.data.toString())
  
  if (!gameSession.hodlupGame) {
    throw new Error('No active HODLUP game')
  }
  
  try {
    const result = gameSession.hodlupGame.mineForBitcoin(
      gameSession.localPlayerId, 
      selectedCards
    )
    
    // Broadcast mining result to all players
    broadcastToPlayers('MINING_RESULT', { result, playerId: gameSession.localPlayerId })
    
    // Send updated game state
    sendHodlupGameStateUpdate()
    
    // Send result to UI
    sendToUI(RPC_HODLUP_TIME_CHAIN_UPDATE, result)
    
  } catch (error) {
    sendToUI(RPC_GAME_ERROR, { message: error.message })
  }
}

async function handleHodlupAddMiningRig(req) {
  if (!gameSession.hodlupGame) {
    throw new Error('No active HODLUP game')
  }
  
  try {
    const result = gameSession.hodlupGame.addMiningRig(gameSession.localPlayerId)
    
    // Broadcast to all players
    broadcastToPlayers('MINING_RIG_ADDED', {
      playerId: gameSession.localPlayerId,
      result
    })
    
    sendHodlupGameStateUpdate()
    sendToUI(RPC_HODLUP_WALLET_UPDATE, result)
    
  } catch (error) {
    sendToUI(RPC_GAME_ERROR, { message: error.message })
  }
}

async function handleHodlupMoveToColdStorage(req) {
  const { amount } = JSON.parse(req.data.toString())
  
  if (!gameSession.hodlupGame) {
    throw new Error('No active HODLUP game')
  }
  
  try {
    const result = gameSession.hodlupGame.moveToColdStorage(
      gameSession.localPlayerId, 
      amount
    )
    
    broadcastToPlayers('COLD_STORAGE_MOVE', {
      playerId: gameSession.localPlayerId,
      amount,
      result
    })
    
    sendHodlupGameStateUpdate()
    sendToUI(RPC_HODLUP_WALLET_UPDATE, result)
    
  } catch (error) {
    sendToUI(RPC_GAME_ERROR, { message: error.message })
  }
}

async function handleHodlupDrawCards(req) {
  if (!gameSession.hodlupGame) {
    throw new Error('No active HODLUP game')
  }
  
  try {
    const drawnCards = gameSession.hodlupGame.drawCards(gameSession.localPlayerId)
    
    sendToUI(RPC_HODLUP_DRAW_NONCE_CARDS, { drawnCards })
    sendHodlupGameStateUpdate()
    
  } catch (error) {
    sendToUI(RPC_GAME_ERROR, { message: error.message })
  }
}

async function handleLeaveGame(req) {
  console.log('Leaving HODLUP game')
  
  if (gameSession.peerDrive) {
    // Notify other players
    broadcastToPlayers('PLAYER_LEFT', { 
      playerId: gameSession.localPlayerId,
      playerName: gameSession.localPlayerName 
    })
    
    await gameSession.peerDrive.close()
 }
 
 // Reset game session
 gameSession = {
   id: null,
   type: null,
   isHost: false,
   gameKey: null,
   hodlupGame: null,
   peerDrive: null,
   connections: new Map(),
   localPlayerId: generatePlayerId(),
   localPlayerName: 'Player' + Math.floor(Math.random() * 1000)
 }
 
 sendToUI(RPC_CONNECTION_STATUS, { status: 'disconnected' })
}

function sendToUI(command, data) {
 const req = rpc.request(command)
 req.send(JSON.stringify(data))
}

function sendHodlupGameStateUpdate() {
 if (!gameSession.hodlupGame) return
 
 const publicGameState = gameSession.hodlupGame.getGameState()
 const privatePlayerState = gameSession.hodlupGame.getPlayerPrivateState(gameSession.localPlayerId)
 
 sendToUI(RPC_GAME_STATE_UPDATE, {
   gameState: publicGameState,
   playerState: privatePlayerState
 })
}

function broadcastToPlayers(messageType, data) {
 if (!gameSession.peerDrive) return
 
 const message = JSON.stringify({
   type: messageType,
   data,
   timestamp: Date.now(),
   sender: gameSession.localPlayerId
 })
 
 // Send to all connected peers via PearDrive
 gameSession.connections.forEach((peer, peerId) => {
   try {
     peer.send(message)
   } catch (error) {
     console.error(`Failed to send message to peer ${peerId}:`, error)
   }
 })
}

// Cleanup on app close
Bare.on('teardown', async () => {
 if (gameSession.peerDrive) {
   await gameSession.peerDrive.close()
 }
})

// Initialize
console.log('HODLUP Casino backend initialized with PearDrive')
sendToUI(RPC_CONNECTION_STATUS, { status: 'ready' })
