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

type CompressedTransaction = [
  [string, string, string, string, string],  // id split into segments
  [number, number],  // timestamp as [seconds, milliseconds]
  number,           // amount in cents
  number,           // type code
  number            // game code
]

const compressTransaction = (tx: Transaction): CompressedTransaction => {
  // Split ID into UUID segments for better compression
  const idSegments = tx.id.split('-')

  // Split timestamp into seconds and remaining milliseconds
  const seconds = Math.floor(tx.timestamp / 1000)
  const milliseconds = tx.timestamp % 1000

  // Convert amount to cents using exact multiplication
  const amountInCents = Math.round(tx.amount * 100)

  return [
    idSegments as [string, string, string, string, string],
    [seconds, milliseconds],
    amountInCents,
    TX_TYPE_MAP[tx.type],
    GAME_MAP[tx.game]
  ]
}

const decompressTransaction = (arr: CompressedTransaction): Transaction => {
  const [idSegments, [seconds, milliseconds], amountInCents, typeCode, gameCode] = arr

  return {
    id: idSegments.join('-'),
    timestamp: (seconds * 1000) + milliseconds,
    amount: amountInCents / 100,
    type: TX_TYPE_MAP_REVERSE[typeCode],
    game: GAME_MAP_REVERSE[gameCode]
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

export const decompressState = (state: StateWithTransactions): StateWithTransactions => {
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
