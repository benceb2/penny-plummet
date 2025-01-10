import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { formatIntAsCurrency } from '@/utils/currencyUtil'
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer'
import { useAchievementStore } from './achievementStore'
import type { UserStore } from './userStore'

export const useClickerStore = defineStore('clicker', () => {
  const OFFLINE_RATE_MULTIPLIER = 0.5 // Half rate when offline
  const MAX_OFFLINE_DAYS = 3
  const MAX_OFFLINE_MS = MAX_OFFLINE_DAYS * 24 * 60 * 60 * 1000


  const achievementStore = useAchievementStore()
  let autoClickerInterval: number | null = null;

  startAutoClicker();

  // State
  const clicks = ref(0)
  const baseClickValue = ref(1)
  const autoClickersCount = ref(0)
  const autoClickerCost = ref(50)
  const multiplierLevel = ref(1)
  const multiplierCost = ref(100)

  // Offline tracking
  const lastOnlineTimestamp = ref(Date.now())
  const showOfflineEarnings = ref(false)
  const offlineEarnings = ref(0)
  const offlineSeconds = ref(0)

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
      const calculatedXP = Math.floor(clicks.value * 0.2)
      achievementStore.addXP(calculatedXP)
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

  // Function to start auto-clicking
  function startAutoClicker() {
    if (typeof window !== 'undefined') {
      // Clear any existing interval first
      if (autoClickerInterval) {
        clearInterval(autoClickerInterval)
      }
      autoClickerInterval = setInterval(() => {
        clicks.value += autoClickersCount.value * clickValue.value
      }, 1000)
    }
  }

  function stopAutoClicker(clearStorage: boolean = true) {
    if (autoClickerInterval) {
      clearInterval(autoClickerInterval)
      autoClickerInterval = null
    }

    if (clearStorage) {
      const clickerStore = localStorage.getItem(calculateStorageKey("clicker-store"))
      if (clickerStore) {
        localStorage.removeItem(calculateStorageKey("clicker-store"))
      }
    }
  }

  function initializeOfflineTracking() {
    if (typeof window !== 'undefined') {
      // Update timestamp when user leaves
      window.addEventListener('beforeunload', () => {
        lastOnlineTimestamp.value = Date.now()
      })

      // Check for offline progress when user returns
      checkOfflineProgress()
    }
  }

  function checkOfflineProgress() {
    const currentTime = Date.now()
    const offlineTime = currentTime - lastOnlineTimestamp.value

    // Cap offline time at MAX_OFFLINE_DAYS
    const cappedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_MS)

    if (cappedOfflineTime > 0) {
      // Calculate earnings: (offline seconds) * (clicks per second) * (offline rate multiplier)
      offlineSeconds.value = Math.floor(cappedOfflineTime / 1000)
      const clicksPerSecond = autoClickersCount.value * clickValue.value
      offlineEarnings.value = Math.floor(offlineSeconds.value * clicksPerSecond * OFFLINE_RATE_MULTIPLIER)

      if (offlineEarnings.value > 0) {
        // Show modal
        showOfflineEarnings.value = true

        // Add earnings
        clicks.value += offlineEarnings.value
      }
    }

    // Reset timestamp
    lastOnlineTimestamp.value = currentTime
  }

  function closeOfflineEarningsModal() {
    showOfflineEarnings.value = false
    offlineEarnings.value = 0
    offlineSeconds.value = 0
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
    lastOnlineTimestamp,
    showOfflineEarnings,
    offlineEarnings,
    offlineSeconds,


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
    reset,
    initializeOfflineTracking,
    checkOfflineProgress,
    closeOfflineEarningsModal,
    startAutoClicker,
    stopAutoClicker
  }
}, {
  persist: {
    key: calculateStorageKey("clicker-store"),
    serializer: createGameSerializer()
  }
} as any) // treating this as any because the TS support for the persistence
// plugin doesn't seem to be working and we cannot compile otherwise.)


export type ClickerStore = ReturnType<typeof useClickerStore>;
