import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import type { Card } from '@/types/Card'
import PlayingCard from '@/views/blackjack/PlayingCard.vue'
import i18n from '@/i18n'

const mountCard = (card: Card, props: Record<string, unknown> = {}) =>
  mount(PlayingCard, {
    props: { card, ...props },
    global: { plugins: [i18n] }
  })

describe('PlayingCard', () => {
  it('renders a face-up card with corner indices and a centre pip', () => {
    const card = { suit: 'hearts', value: 10, display: 'K', faceUp: true } as Card
    const wrapper = mountCard(card)

    const indices = wrapper.findAll('.playing-card-index')
    expect(indices).toHaveLength(2)
    indices.forEach((index) => {
      expect(index.find('b').text()).toBe('K')
      expect(index.find('i').text()).toBe('♥')
    })
    expect(wrapper.find('.playing-card-pip').text()).toBe('♥')
    expect(wrapper.classes()).toContain('playing-card--red')
    expect(wrapper.attributes('aria-label')).toBe('K of hearts')
  })

  it('renders a face-down card as a back with no visible rank', () => {
    const card = { suit: 'spades', value: 5, display: '5', faceUp: false } as Card
    const wrapper = mountCard(card)

    expect(wrapper.find('.playing-card-back').exists()).toBe(true)
    expect(wrapper.find('.playing-card-index').exists()).toBe(false)
    expect(wrapper.attributes('aria-label')).toBe('Face-down card')
  })

  it('applies the red modifier only to hearts and diamonds', () => {
    const red = mountCard({ suit: 'diamonds', value: 7, display: '7', faceUp: true } as Card)
    const black = mountCard({ suit: 'clubs', value: 7, display: '7', faceUp: true } as Card)

    expect(red.classes()).toContain('playing-card--red')
    expect(black.classes()).not.toContain('playing-card--red')
  })

  it('renders the correct suit symbol for every suit', () => {
    const suits: Record<Card['suit'], string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    }

    for (const [suit, symbol] of Object.entries(suits)) {
      const wrapper = mountCard({ suit, value: 2, display: '2', faceUp: true } as Card)
      expect(wrapper.find('.playing-card-pip').text()).toBe(symbol)
    }
  })

  it('applies the sm size modifier and a per-card deal delay when dealIndex is set', () => {
    const card = { suit: 'spades', value: 3, display: '3', faceUp: true } as Card
    const wrapper = mountCard(card, { size: 'sm', dealIndex: 2 })

    expect(wrapper.classes()).toContain('playing-card--sm')
    expect(wrapper.classes()).toContain('playing-card--dealt')
    expect(wrapper.attributes('style')).toContain('--pp-deal-index: 2')
  })
})
