import type { StateTree } from "pinia"
import pkg from '../../package.json'
import type { Transaction } from "@/types/Transaction"

const SHIFT = 11
export const SIGNATURE = btoa("penny-plummet-2024")

type TransactionType = Transaction['type']
type GameType = Transaction['game']

// Update map types to use the literal types
const TX_TYPE_MAP: Record<TransactionType, number> = {
  'win': 1,
  'loss': 2,
  'push': 3,
  'income': 4
}

const TX_TYPE_MAP_REVERSE: Record<number, TransactionType> = Object.fromEntries(
  Object.entries(TX_TYPE_MAP).map(([k, v]) => [v, k as TransactionType])
)

const GAME_MAP: Record<GameType, number> = {
  'blackjack': 1,
  'roulette': 2,
  'clicker': 3
}

const GAME_MAP_REVERSE: Record<number, GameType> = Object.fromEntries(
  Object.entries(GAME_MAP).map(([k, v]) => [v, k as GameType])
)

// Define the compressed transaction type
type CompressedTransaction = [
  string,    // id without dashes
  number,    // timestamp in seconds
  number,    // amount in cents
  number,    // type code
  number     // game code
]

const compressTransaction = (tx: Transaction): CompressedTransaction => [
  tx.id.replace(/-/g, ''),
  Math.floor(tx.timestamp / 1000),
  Math.round(tx.amount * 100),
  TX_TYPE_MAP[tx.type],
  GAME_MAP[tx.game]
]

const decompressTransaction = (arr: CompressedTransaction): Transaction => {
  console.log('Decompressing transaction', arr)

  return {
    id: arr[0],
    timestamp: arr[1] * 1000,
    amount: arr[2] / 100,
    type: TX_TYPE_MAP_REVERSE[arr[3]],
    game: GAME_MAP_REVERSE[arr[4]]
  }
}

// Define interface for state that might have transactions
interface StateWithTransactions extends StateTree {
  transactions?: {
    value: Transaction[] | CompressedTransaction[]
  }
}

const compressState = (state: StateWithTransactions): StateWithTransactions => {
  const compressed = { ...state }

  if (compressed.transactions?.value?.length) {
    const isUncompressed = !Array.isArray(compressed.transactions.value[0])
    if (isUncompressed) {
      console.log('Uncompressing transactions')
      compressed.transactions.value = compressed.transactions.value.map(tx =>
        compressTransaction(tx as Transaction)
      )
    }
  }

  return compressed
}

const decompressState = (state: StateWithTransactions): StateWithTransactions => {
  const decompressed = { ...state }

  if (decompressed.transactions?.value?.length) {
    const isCompressed = Array.isArray(decompressed.transactions.value[0])
    if (isCompressed) {
      decompressed.transactions.value = decompressed.transactions.value.map(tx =>
        decompressTransaction(tx as CompressedTransaction)
      )
    }
  }

  return decompressed
}

// Rest of the code remains the same
export const shiftString = (str: string, shift: number): string => {
  return str.split('').map(char =>
    String.fromCharCode(char.charCodeAt(0) + shift)
  ).join('')
}

const unshiftString = (str: string, shift: number): string => {
  return str.split('').map(char =>
    String.fromCharCode(char.charCodeAt(0) - shift)
  ).join('')
}

interface SaveData {
  state: StateWithTransactions
  timestamp: number
  version: string
}

const encode = (state: StateWithTransactions): string => {
  const saveData: SaveData = {
    state: compressState(state),
    timestamp: Date.now(),
    version: pkg.version
  }
  const stateStr = JSON.stringify(saveData)
  const shifted = shiftString(stateStr, SHIFT)
  const encoded = btoa(shifted)
  return encoded.split('').reverse().join('') + SIGNATURE
}

const decode = (stored: string): StateWithTransactions => {
  try {
    if (!stored.endsWith(SIGNATURE)) {
      return {} as StateWithTransactions
    }
    const encoded = stored.slice(0, -SIGNATURE.length)
    const reversed = encoded.split('').reverse().join('')
    const decoded = atob(reversed)
    const unshifted = unshiftString(decoded, SHIFT)
    const saveData = JSON.parse(unshifted) as SaveData
    return decompressState(saveData.state)
  } catch {
    return {} as StateWithTransactions
  }
}

export const calculateStorageKey = (key: string) => {
  const shifted = shiftString(key, SHIFT)
  const encoded = btoa(shifted)
  return encoded.split('').reverse().join('') + SIGNATURE
}

export const createGameSerializer = () => ({
  serialize: encode,
  deserialize: decode
})
