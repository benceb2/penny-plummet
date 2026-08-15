<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { navItems } from './navItems'

const { t } = useI18n()
const route = useRoute()

const isActive = (to: string) => route.path === to
</script>

<template>
  <nav class="app-tabbar d-lg-none" :aria-label="t('appShell.tabBar.label')">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="tab"
      :class="{ 'is-active': isActive(item.to) }">
      <i :class="['bi', item.icon]" aria-hidden="true"></i>
      <span>{{ t(item.labelKey) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1030;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: calc(var(--pp-tabbar-height) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--pp-ground);
  border-top: 1px solid rgba(255, 255, 255, .06);
}

.tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  min-height: 44px;
  color: rgba(244, 238, 223, .5);
  text-decoration: none;
  font-size: .65rem;
  font-weight: 600;
  letter-spacing: .01em;
}

.tab i {
  font-size: 1.25rem;
}

.tab.is-active {
  color: var(--pp-gold);
}

.tab.is-active::before {
  content: '';
  position: absolute;
  top: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--pp-gold);
}
</style>
