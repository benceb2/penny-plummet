import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayingCard from '@/components/PlayingCard.vue'
import type { Card } from '@/types/Card'

describe('PlayingCard', () => {
  it('should render card face up correctly', () => {
    const card = {
      suit: 'hearts',
      value: 10,
      display: 'K',
      faceUp: true
    } as Card

    const wrapper = mount(PlayingCard, {
      props: {
        card
      }
    })

    // Check if the card shows the correct display value
    expect(wrapper.find('.card-value').text()).toBe('K')

    // Check if hearts render with the correct symbol
    expect(wrapper.find('.card-suit').text()).toBe('♥')

    // Check if hearts have the danger (red) color class
    expect(wrapper.classes()).toContain('text-danger')
  })

  it('should render card back when face down', () => {
    const card = {
      suit: 'spades',
      value: 5,
      display: '5',
      faceUp: false
    } as Card

    const wrapper = mount(PlayingCard, {
      props: {
        card
      }
    })

    // Check if card back is visible
    expect(wrapper.find('.card-back').exists()).toBe(true)

    // Check that card face is not visible
    expect(wrapper.find('.card-value').exists()).toBe(false)
  })

  // Test suit color classes
  it('should apply red color class only to hearts and diamonds', async () => {
    const redCard = {
      suit: 'diamonds',
      value: 7,
      display: '7',
      faceUp: true
    } as Card

    const blackCard = {
      suit: 'clubs',
      value: 7,
      display: '7',
      faceUp: true
    } as Card

    const redWrapper = mount(PlayingCard, {
      props: { card: redCard }
    })

    const blackWrapper = mount(PlayingCard, {
      props: { card: blackCard }
    })

    expect(redWrapper.classes()).toContain('text-danger')
    expect(blackWrapper.classes()).not.toContain('text-danger')
  })

  // Test suit symbols
  it('should render correct suit symbols', () => {
    const suits = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    }

    for (const [suit, symbol] of Object.entries(suits)) {
      const card = {
        suit,
        value: 2,
        display: '2',
        faceUp: true
      } as Card

      const wrapper = mount(PlayingCard, {
        props: { card }
      })

      expect(wrapper.find('.card-suit').text()).toBe(symbol)
    }
  })

  it('should have the correct structure when face up', () => {
    const card = {
      suit: 'spades',
      value: 3,
      display: '3',
      faceUp: true
    } as Card

    const wrapper = mount(PlayingCard, {
      props: { card }
    })

    // Check basic structure exists
    expect(wrapper.find('.playing-card').exists()).toBe(true)
    expect(wrapper.find('.card-value').exists()).toBe(true)
    expect(wrapper.find('.card-suit').exists()).toBe(true)
    expect(wrapper.find('.suit-large').exists()).toBe(true)

    // Check we have both corners and center
    const corners = wrapper.findAll('.card-value')
    expect(corners).toHaveLength(2) // Should have top and bottom value
  })
})
