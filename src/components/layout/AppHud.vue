<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useAnimatedNumber } from '@/composables/useAnimatedNumber'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import { navItems } from './navItems'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const achievementStore = useAchievementStore()

const isActive = (to: string) => route.path === to

const animatedChips = useAnimatedNumber(computed(() => userStore.chips))
const formattedAnimatedChips = computed(() => formatIntAsCurrency(Math.round(animatedChips.value)))

const levelProgress = computed(() => Math.min(100, Math.max(0, achievementStore.levelProgress)))
const ringStyle = computed(() => ({
  background: `conic-gradient(var(--pp-gold) ${levelProgress.value}%, rgba(255, 255, 255, .1) 0)`
}))
</script>

<template>
  <header class="app-hud">
    <RouterLink to="/" class="hud-brand">
      <i class="bi bi-coin" aria-hidden="true"></i>
      <span>{{ t('appShell.brand') }}</span>
    </RouterLink>

    <nav class="hud-nav d-none d-lg-flex" :aria-label="t('appShell.nav.label')">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="hud-nav-link"
        :class="{ 'is-active': isActive(item.to) }">
        {{ t(item.labelKey) }}
      </RouterLink>
    </nav>

    <div class="hud-right">
      <div class="hud-chips">
        <i class="bi bi-coin" aria-hidden="true"></i>
        <span class="visually-hidden">{{ t('appShell.chipsLabel') }}</span>
        <span>{{ formattedAnimatedChips }}</span>
      </div>
      <RouterLink
        to="/profile"
        class="hud-level"
        :style="ringStyle"
        :aria-label="t('appShell.levelLabel', { level: achievementStore.currentLevel.level, progress: Math.floor(levelProgress) })">
        <b>{{ achievementStore.currentLevel.level }}</b>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.app-hud {
  position: sticky;
  top: 0;
  z-index: 1030;
  flex: 0 0 auto;
  height: calc(var(--pp-hud-height) + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: env(safe-area-inset-top, 0px) .75rem 0 1rem;
  background: var(--pp-surface);
  border-bottom: 1px solid var(--pp-line);
}

.hud-brand {
  display: flex;
  align-items: center;
  gap: .5rem;
  color: var(--pp-gold);
  text-decoration: none;
  min-width: 0;
}

.hud-brand:hover {
  color: var(--pp-gold-bright);
}

.hud-brand span {
  font-family: var(--pp-font-display);
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .22em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hud-nav {
  align-items: center;
  gap: 1.25rem;
}

.hud-nav-link {
  color: rgba(244, 238, 223, .7);
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
  letter-spacing: .02em;
  padding: .25rem 0;
}

.hud-nav-link:hover {
  color: var(--pp-cream);
}

.hud-nav-link.is-active {
  color: var(--pp-gold);
}

.hud-right {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex: 0 0 auto;
}

.hud-chips {
  display: flex;
  align-items: center;
  gap: .375rem;
  height: 32px;
  padding: 0 .75rem 0 .55rem;
  border-radius: 999px;
  background: var(--pp-surface-2);
  border: 1px solid rgba(225, 178, 90, .42);
  color: var(--pp-cream);
  font-weight: 700;
  font-size: .9rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.hud-chips i {
  color: var(--pp-gold);
  font-size: .8rem;
}

.hud-level {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  text-decoration: none;
  flex: 0 0 auto;
}

.hud-level b {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--pp-surface);
  display: grid;
  place-items: center;
  font-size: .68rem;
  font-weight: 700;
  color: var(--pp-cream);
}
</style>
