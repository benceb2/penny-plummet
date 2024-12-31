import type { Card } from "@/types/Card"

export function generateDeck(): Card[] {
  const deck: Card[] = []
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades']

  suits.forEach(suit => {
    // Ace
    deck.push({ suit, value: 1, faceUp: true })

    // Number cards (2-10)
    for (let value = 2; value <= 10; value++) {
      deck.push({ suit, value, faceUp: true })
    }

    // Face cards (Jack, Queen, King)
    for (let i = 0; i < 3; i++) {
      deck.push({ suit, value: 10, faceUp: true })
    }
  })

  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  return [...deck].sort(() => Math.random() - 0.5)
}

export function calculateHandValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  // First pass: calculate non-ace values and count aces
  for (const card of cards) {
    if (card.value === 1) {
      aces++;
    } else if (card.value > 10) {
      value += 10;  // Face cards are worth 10
    } else {
      value += card.value;
    }
  }

  // Second pass: add aces optimally
  while (aces > 0) {
    // Add 11 if it won't cause a bust, otherwise add 1
    if (value + 11 <= 21) {
      value += 11;
    } else {
      value += 1;
    }
    aces--;
  }

  return value;
}