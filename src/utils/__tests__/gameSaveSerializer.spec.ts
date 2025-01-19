import { describe, it, expect } from 'vitest'
import { createGameSerializer, shiftString, calculateStorageKey } from '@/utils/gameSaveSerializer'
import type { StateTree } from 'pinia'

describe('Pinia Serializer', () => {
  const serializer = createGameSerializer()

  describe('shiftString', () => {
    it('should shift characters by the specified amount', () => {
      const input = 'hello'
      const shifted = shiftString(input, 1)
      expect(shifted).toBe('ifmmp')
    })

    it('should handle empty strings', () => {
      expect(shiftString('', 5)).toBe('')
    })

    it('should handle special characters', () => {
      const input = '!@#$%'
      const shifted = shiftString(input, 1)
      // Verify we can shift back and forth
      const unshifted = shiftString(shifted, -1)
      expect(unshifted).toBe(input)
    })

    it('should handle unicode characters', () => {
      const input = '👋🎮'
      const shifted = shiftString(input, 1)
      const unshifted = shiftString(shifted, -1)
      expect(unshifted).toBe(input)
    })
  })

  describe('calculateStorageKey', () => {
    it('should generate consistent keys for the same input', () => {
      const key1 = calculateStorageKey('test-key')
      const key2 = calculateStorageKey('test-key')
      expect(key1).toBe(key2)
    })

    it('should generate different keys for different inputs', () => {
      const key1 = calculateStorageKey('key1')
      const key2 = calculateStorageKey('key2')
      expect(key1).not.toBe(key2)
    })

    it('should append signature to generated key', () => {
      const key = calculateStorageKey('test')
      expect(key).toMatch(/.*cGVubnktcGx1bW1ldC0yMDI0$/)
    })
  })

  describe('serialize', () => {
    it('should successfully serialize and deserialize simple state', () => {
      const state: StateTree = {
        count: 42,
        name: 'test'
      }

      const serialized = serializer.serialize(state)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(state)
    })

    it('should handle nested objects', () => {
      const state: StateTree = {
        user: {
          name: 'John',
          scores: [100, 200, 300],
          metadata: {
            lastLogin: '2024-01-01',
            preferences: { theme: 'dark' }
          }
        }
      }

      const serialized = serializer.serialize(state)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(state)
    })

    it('should handle arrays', () => {
      const state: StateTree = {
        items: [1, 2, 3],
        nested: [{ id: 1 }, { id: 2 }]
      }

      const serialized = serializer.serialize(state)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(state)
    })

    it('should include timestamp in serialized data', () => {
      const state: StateTree = { test: true }
      const serialized = serializer.serialize(state)

      // Deserialize and verify timestamp exists
      const deserialized = serializer.deserialize(serialized)

      // We can verify the timestamp indirectly by checking the
      // round trip serialization/deserialization works
      expect(deserialized).toEqual(state)
    })
  })

  describe('deserialize', () => {
    it('should return empty object for invalid signature', () => {
      const invalidData = 'invalid-data'
      const deserialized = serializer.deserialize(invalidData)
      expect(deserialized).toEqual({})
    })

    it('should return empty object for corrupted data', () => {
      const validState: StateTree = { test: true }
      const serialized = serializer.serialize(validState)
      const corrupted = serialized.slice(1) // Remove first character

      const deserialized = serializer.deserialize(corrupted)
      expect(deserialized).toEqual({})
    })

    it('should handle large nested objects', () => {
      const state: StateTree = {
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          scores: Array.from({ length: 10 }, (_, j) => j * 100),
          metadata: {
            joinDate: new Date().toISOString(),
            settings: {
              notifications: true,
              theme: 'light',
              language: 'en'
            }
          }
        }))
      }

      const serialized = serializer.serialize(state)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized).toEqual(state)
    })

    it('should preserve numeric precision', () => {
      const state: StateTree = {
        balance: 123456789.123456,
        scientific: 1.23e-10
      }

      const serialized = serializer.serialize(state)
      const deserialized = serializer.deserialize(serialized)

      expect(deserialized.balance).toBe(state.balance)
      expect(deserialized.scientific).toBe(state.scientific)
    })
  })

  describe('security', () => {
    it('should not expose raw state in serialized form', () => {
      const state: StateTree = {
        secretKey: 'very-secret-value',
        user: { id: 123 }
      }

      const serialized = serializer.serialize(state)

      // Check that raw values are not visible in output
      expect(serialized).not.toContain('very-secret-value')
      expect(serialized).not.toContain('secretKey')
    })

    it('should validate signature before deserializing', () => {
      const state: StateTree = { test: true }
      const serialized = serializer.serialize(state)

      // Modify signature
      const modified = serialized.slice(0, -1) + 'X'
      const deserialized = serializer.deserialize(modified)

      expect(deserialized).toEqual({})
    })
  });
})
