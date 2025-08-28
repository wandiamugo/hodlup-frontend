// rpc-commands.mjs

// Game Management Commands
export const RPC_CREATE_GAME = 0
export const RPC_JOIN_GAME = 1
export const RPC_LEAVE_GAME = 2
export const RPC_GAME_CREATED = 3
export const RPC_GAME_JOINED = 4
export const RPC_GAME_ERROR = 5

// Player Management
export const RPC_PLAYER_JOINED = 10
export const RPC_PLAYER_LEFT = 11
export const RPC_PLAYER_UPDATE = 12

// Game State
export const RPC_GAME_STATE_UPDATE = 20
export const RPC_GAME_START = 21
export const RPC_GAME_END = 22
export const RPC_ROUND_START = 23
export const RPC_ROUND_END = 24

// HODLUP Specific Commands
export const RPC_HODLUP_MINE_FOR_BITCOIN = 30
export const RPC_HODLUP_ADD_MINING_RIG = 31
export const RPC_HODLUP_MOVE_TO_COLD_STORAGE = 32
export const RPC_HODLUP_DRAW_NONCE_CARDS = 33
export const RPC_HODLUP_CREATE_TRANSACTION = 34
export const RPC_HODLUP_VALIDATE_BLOCK = 35
export const RPC_HODLUP_UPDATE_DIFFICULTY = 36
export const RPC_HODLUP_DEFENSE_ROLL = 37

// HODLUP Game State Updates
export const RPC_HODLUP_TIME_CHAIN_UPDATE = 40
export const RPC_HODLUP_WALLET_UPDATE = 41
export const RPC_HODLUP_MINING_RIGS_UPDATE = 42
export const RPC_HODLUP_BITCOIN_TOKENS_UPDATE = 43
export const RPC_HODLUP_DIFFICULTY_UPDATE = 44
export const RPC_HODLUP_NONCE_CARDS_UPDATE = 45

// Connection Status
export const RPC_CONNECTION_STATUS = 50
export const RPC_PEER_COUNT = 51

// Chat/Communication
export const RPC_CHAT_MESSAGE = 60
export const RPC_SYSTEM_MESSAGE = 61
