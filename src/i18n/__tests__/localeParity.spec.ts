import { describe, expect, it } from 'vitest'

import en from '@/locales/en'
import hu from '@/locales/hu'

type LocaleTree = Record<string, unknown>

type LocaleLeaf = {
  placeholders: Set<string>
}

const PLACEHOLDER_PATTERN = /\{([^}]+)\}/g

function getPlaceholders(text: string): Set<string> {
  const placeholders = new Set<string>()

  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    const name = match[1]?.trim()
    if (name) {
      placeholders.add(name)
    }
  }

  return placeholders
}

function flattenLocaleMessages(
  tree: LocaleTree,
  parentKey = ''
): Map<string, LocaleLeaf> {
  const flatMap = new Map<string, LocaleLeaf>()

  for (const [key, value] of Object.entries(tree)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key

    if (typeof value === 'string') {
      flatMap.set(fullKey, {
        placeholders: getPlaceholders(value)
      })
      continue
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nestedMap = flattenLocaleMessages(value as LocaleTree, fullKey)
      for (const [nestedKey, nestedValue] of nestedMap.entries()) {
        flatMap.set(nestedKey, nestedValue)
      }
      continue
    }

    throw new Error(`Locale key "${fullKey}" must be a string or object.`)
  }

  return flatMap
}

function toSortedList(values: Set<string>): string[] {
  return [...values].sort((a, b) => a.localeCompare(b))
}

describe('i18n locale parity', () => {
  it('keeps hu-HU aligned with en-GB keys and placeholders', () => {
    const baseMessages = flattenLocaleMessages(en as LocaleTree)
    const targetMessages = flattenLocaleMessages(hu as LocaleTree)

    const missingKeys = new Set<string>()
    const extraKeys = new Set<string>()
    const placeholderMismatches: string[] = []

    for (const [key, baseLeaf] of baseMessages.entries()) {
      const targetLeaf = targetMessages.get(key)
      if (!targetLeaf) {
        missingKeys.add(key)
        continue
      }

      const basePlaceholders = toSortedList(baseLeaf.placeholders)
      const targetPlaceholders = toSortedList(targetLeaf.placeholders)

      if (JSON.stringify(basePlaceholders) !== JSON.stringify(targetPlaceholders)) {
        placeholderMismatches.push(
          `${key}: expected {${basePlaceholders.join(', ')}} got {${targetPlaceholders.join(', ')}}`
        )
      }
    }

    for (const key of targetMessages.keys()) {
      if (!baseMessages.has(key)) {
        extraKeys.add(key)
      }
    }

    expect(
      toSortedList(missingKeys),
      'Missing keys in hu-HU compared to en-GB'
    ).toEqual([])
    expect(
      toSortedList(extraKeys),
      'Unexpected extra keys in hu-HU compared to en-GB'
    ).toEqual([])
    expect(
      placeholderMismatches.sort((a, b) => a.localeCompare(b)),
      'Placeholder mismatches between en-GB and hu-HU'
    ).toEqual([])
  })
})
