const SALT = "hey-what-you-doing-here-buddy"

const encode = (state: any): string => {
  const stateStr = JSON.stringify(state)
  return btoa(stateStr).split('').reverse().join('') + SALT
}

const decode = (stored: string): any => {
  if (!stored.endsWith(SALT)) {
    return null // Invalid data
  }

  const encoded = stored.slice(0, -SALT.length)
  try {
    const reversed = encoded.split('').reverse().join('')
    const decoded = atob(reversed)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const createGameSerializer = () => ({
  serialize: encode,
  deserialize: decode
})
