import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { formatIntAsCurrency } from '@/utils/currency'
import { calculateStorageKey, createGameSerializer } from '@/utils/serializer'
import { useAchievementStore } from './achievement'
import type { UserStore } from './user'

export const useClickerStore = defineStore('clicker', () => {

  const achievementStore = useAchievementStore()

  // State
  const clicks = ref(0)
  const baseClickValue = ref(1)
  const autoClickersCount = ref(0)
  const autoClickerCost = ref(50)
  const multiplierLevel = ref(1)
  const multiplierCost = ref(100)

  // Computed
  const clickValue = computed(() => baseClickValue.value * multiplierLevel.value)
  const formattedClickValue = computed(() => formatIntAsCurrency(clickValue.value))
  const formattedAutoClickerCost = computed(() => formatIntAsCurrency(autoClickerCost.value))
  const formattedMultiplierCost = computed(() => formatIntAsCurrency(multiplierCost.value))
  const formattedClicks = computed(() => formatIntAsCurrency(clicks.value))

  // Actions
  function handleClick() {
    clicks.value += clickValue.value
    achievementStore.updateAchievementProgress('click_novice', clicks.value)
    achievementStore.updateAchievementProgress('click_master', clicks.value)
  }

  function collectChips(userStore: UserStore) {
    if (clicks.value >= 10) {
      userStore.updateChips(clicks.value)
      clicks.value = 0
    }
  }

  function buyAutoClicker(userStore: UserStore) {
    if (userStore.chips >= autoClickerCost.value) {
      userStore.updateChips(-autoClickerCost.value)
      autoClickersCount.value++
      autoClickerCost.value = Math.floor(autoClickerCost.value * 1.5)
      achievementStore.updateAchievementProgress('auto_collector', autoClickersCount.value)
      achievementStore.updateAchievementProgress('auto_empire', autoClickersCount.value)
    }
  }

  function buyMultiplier(userStore: UserStore) {
    if (userStore.chips >= multiplierCost.value) {
      userStore.updateChips(-multiplierCost.value)
      multiplierLevel.value++
      multiplierCost.value = Math.floor(multiplierCost.value * 2)
      achievementStore.updateAchievementProgress('multiplier_enthusiast', multiplierLevel.value)
    }
  }

  // Auto-clicker interval
  if (typeof window !== 'undefined') {
    setInterval(() => {
      clicks.value += autoClickersCount.value * clickValue.value
    }, 1000)
  }

  // Reset state
  function reset() {
    clicks.value = 0
    baseClickValue.value = 1
    autoClickersCount.value = 0
    autoClickerCost.value = 50
    multiplierLevel.value = 1
    multiplierCost.value = 100
  }

  return {
    // State
    clicks,
    baseClickValue,
    autoClickersCount,
    autoClickerCost,
    multiplierLevel,
    multiplierCost,

    // Computed
    clickValue,
    formattedClickValue,
    formattedAutoClickerCost,
    formattedMultiplierCost,
    formattedClicks,

    // Actions
    handleClick,
    collectChips,
    buyAutoClicker,
    buyMultiplier,
    reset
  }
}, {
  persist: {
    key: calculateStorageKey("clicker-store"),
    serializer: createGameSerializer()
  }
})
