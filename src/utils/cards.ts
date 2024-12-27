import type { Card } from "@/types/Card"

export function generateDeck(): Card[] {
  const deck: Card[] = []
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades']

  suits.forEach(suit => {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value, faceUp: true })
    }
  })

  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  return [...deck].sort(() => Math.random() - 0.5)
}

export function calculateHandValue(cards: Card[]): number {
  let value = cards.reduce((acc, card) => acc + card.value, 0)

  return value
}