<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'
import ToastContainer from './ToastContainer.vue'

const { t, locale } = useI18n()
const userStore = useUserStore()
const achievementStore = useAchievementStore()
const isNavOpen = ref(false)

const availableLocales = ['en-GB', 'hu-HU'] as const
type Locale = typeof availableLocales[number]

const flags: Record<Locale, string> = {
  'en-GB': '/flags/gb.png',
  'hu-HU': '/flags/hu.png'
}

const switchLanguage = (newLocale: Locale) => {
  locale.value = newLocale
}

watch(locale, (newLocale) => {
  localStorage.setItem('userLocale', newLocale)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-coin-fill text-warning me-2"></i>
        {{ t('navbar.brand') }}
      </RouterLink>

      <!-- Mobile Toggle -->
      <button
        class="navbar-toggler"
        type="button"
        @click="isNavOpen = !isNavOpen"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Main Navigation Content -->
      <div
        class="navbar-collapse"
        :class="{ 'show': isNavOpen, 'collapse': !isNavOpen }"
        id="navbarNav">

        <!-- Left Side - Navigation -->
        <ul class="navbar-nav me-auto">
          <!-- Games Dropdown -->
          <li class="nav-item dropdown me-3">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
              data-bs-toggle="dropdown">
              <i class="bi bi-controller me-2"></i>
              {{ t('navbar.games.title') }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink class="dropdown-item" to="/blackjack" @click="isNavOpen = false">
                  <i class="bi bi-suit-spade-fill me-2"></i>
                  {{ t('navbar.games.blackjack') }}
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/roulette" @click="isNavOpen = false">
                  <i class="bi bi-dice-5-fill me-2"></i>
                  {{ t('navbar.games.roulette') }}
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Earn Dropdown -->
          <li class="nav-item dropdown me-3">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
              data-bs-toggle="dropdown">
              <i class="bi bi-cash-coin me-2"></i>
              {{ t('navbar.earn.title') }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink class="dropdown-item" to="/clicker" @click="isNavOpen = false">
                  <i class="bi bi-piggy-bank me-2"></i>
                  {{ t('navbar.earn.clicker') }}
                </RouterLink>
              </li>
              <li class="d-lg-none">
                <RouterLink class="dropdown-item" to="/transactions" @click="isNavOpen = false">
                  <i class="fa fa-history me-2"></i>
                  {{ t('navbar.wallet.transactions') }}
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- About -->
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              @click="isNavOpen = false"
              to="/about">
              <i class="bi bi-info-circle-fill me-2"></i>
              {{ t('navbar.about') }}
            </RouterLink>
          </li>
        </ul>

        <!-- Mobile Separator -->
        <hr class="d-lg-none text-white-50 my-3">

        <!-- Right Side - User Info -->
        <div class="d-flex align-items-center flex-column flex-lg-row gap-3">

          <!-- Stats Row -->
          <div class="d-flex align-items-center gap-2">
            <!-- Chips -->
            <span class="badge bg-success fs-6 px-3 py-2 me-2">
              <i class="bi bi-wallet2 me-1"></i>
              {{ userStore.formattedChips }}
            </span>

            <!-- Level with Progress -->
            <span class="badge bg-info fs-6 px-3 py-2 d-flex align-items-center">
              <i class="bi bi-stars me-2"></i>
              {{ achievementStore.currentLevel.level }}
              <div class="progress ms-2" style="width: 30px; height: 4px;">
                <div
                  class="progress-bar bg-white"
                  :style="{ width: achievementStore.levelProgress + '%' }">
                </div>
              </div>
            </span>
          </div>

          <!-- Controls Row -->
          <div class="d-flex align-items-center gap-3">
            <!-- Language Selector -->
            <div class="dropdown">
              <button
                class="btn btn-secondary btn-sm d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown">
                <img
                  :src="flags[locale as Locale]"
                  :alt="locale"
                  width="18"
                  height="13"
                  class="me-2" />
                <span class="d-none d-sm-inline">{{ t(`languages.${locale}`) }}</span>
                <i class="bi bi-chevron-down ms-1"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li v-for="loc in availableLocales" :key="loc">
                  <a
                    class="dropdown-item d-flex align-items-center gap-2"
                    href="#"
                    @click.prevent="switchLanguage(loc)"
                    :class="{ 'active': locale === loc }">
                    <img
                      :src="flags[loc]"
                      :alt="loc"
                      width="16"
                      height="12" />
                    {{ t(`languages.${loc}`) }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- User Menu -->
            <div class="dropdown">
              <button
                class="btn btn-primary btn-sm d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                <span class="d-none d-sm-inline">{{ userStore.username }}</span>
                <i class="bi bi-chevron-down ms-1"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <RouterLink to="/profile" class="dropdown-item">
                    <i class="bi bi-person me-2"></i>
                    {{ t('navbar.profile.viewProfile') }}
                  </RouterLink>
                </li>
                <li class="d-none d-lg-block">
                  <RouterLink to="/transactions" class="dropdown-item">
                    <i class="fa fa-history me-2"></i>
                    {{ t('navbar.wallet.transactions') }}
                  </RouterLink>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <RouterLink to="/settings" class="dropdown-item">
                    <i class="bi bi-gear me-2"></i>
                    {{ t('navbar.profile.settings') }}
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <ToastContainer />
</template>

<style scoped>
.progress {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
