import type { StateTree } from "pinia"
import pkg from '../../package.json'

const SHIFT = 11
export const SIGNATURE = btoa("penny-plummet-2024")

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

const encode = (state: StateTree): string => {
  const saveData = {
    state: state,
    timestamp: Date.now(),
    version: pkg.version
  }
  const stateStr = JSON.stringify(saveData)
  const shifted = shiftString(stateStr, SHIFT)
  const encoded = btoa(shifted)
  return encoded.split('').reverse().join('') + SIGNATURE
}

const decode = (stored: string): StateTree => {
  try {
    if (!stored.endsWith(SIGNATURE)) {
      return {} as StateTree
    }
    const encoded = stored.slice(0, -SIGNATURE.length)
    if (encoded.length % 4 !== 0) {
      return {} as StateTree
    }
    const reversed = encoded.split('').reverse().join('')
    const decoded = atob(reversed)
    const unshifted = unshiftString(decoded, SHIFT)
    const saveData = JSON.parse(unshifted)
    if (!saveData || typeof saveData !== 'object') {
      return {} as StateTree
    }
    if (!('state' in saveData) || !('timestamp' in saveData) || !('version' in saveData)) {
      return {} as StateTree
    }
    if (typeof saveData.timestamp !== 'number' || typeof saveData.version !== 'string') {
      return {} as StateTree
    }
    if (typeof saveData.state !== 'object' || saveData.state === null) {
      return {} as StateTree
    }
    return saveData.state
  } catch {
    return {} as StateTree
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
