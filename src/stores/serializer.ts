const SHIFT = 11
const SIGNATURE = btoa("penny-plummet-2024")

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

const encode = (state: any): string => {
  const saveData = {
    state: state,
    timestamp: Date.now()
  }
  const stateStr = JSON.stringify(saveData)
  // Add the character shift before base64
  const shifted = shiftString(stateStr, SHIFT)
  const encoded = btoa(shifted)
  return encoded.split('').reverse().join('') + SIGNATURE
}

const decode = (stored: string): any => {
  try {
    if (!stored.endsWith(SIGNATURE)) {
      return null
    }
    const encoded = stored.slice(0, -SIGNATURE.length)
    const reversed = encoded.split('').reverse().join('')
    const decoded = atob(reversed)
    // Unshift after base64 decode
    const unshifted = unshiftString(decoded, SHIFT)
    const saveData = JSON.parse(unshifted)
    return saveData.state
  } catch {
    return null
  }
}

export const calculateStorageKey = (key: string) => {
  // shift
  const shifted = shiftString(key, SHIFT)
  // base64
  const encoded = btoa(shifted)
  return encoded.split('').reverse().join('') + SIGNATURE
}

export const createGameSerializer = () => ({
  serialize: encode,
  deserialize: decode
})
