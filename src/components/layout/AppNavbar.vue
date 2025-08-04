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
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand fw-bold d-flex align-items-center" to="/">
        <i class="bi bi-coin-fill text-warning me-2"></i>
        <span class="brand-text">{{ t('navbar.brand') }}</span>
      </RouterLink>

      <!-- Mobile Toggle -->
      <button
        class="navbar-toggler border-0"
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

        <!-- Left Side Navigation Links - Games First -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3 nav-link-hover"
              @click="isNavOpen = false"
              to="/blackjack">
              <i class="bi bi-suit-spade-fill me-2"></i>
              {{ t('navbar.games.blackjack') }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3 nav-link-hover"
              @click="isNavOpen = false"
              to="/roulette">
              <i class="bi bi-dice-5-fill me-2"></i>
              {{ t('navbar.games.roulette') }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3 nav-link-hover"
              @click="isNavOpen = false"
              to="/clicker">
              <i class="bi bi-piggy-bank me-2"></i>
              {{ t('navbar.wallet.clicker') }}
            </RouterLink>
          </li>
          <li class="nav-item d-lg-none">
            <!-- Show transactions on mobile -->
            <RouterLink
              class="nav-link px-3 nav-link-hover"
              @click="isNavOpen = false"
              to="/transactions">
              <i class="fa fa-history me-2"></i>
              {{ t('navbar.wallet.transactions') }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3 nav-link-hover"
              @click="isNavOpen = false"
              to="/about">
              <i class="bi bi-info-circle-fill me-2"></i>
              {{ t('navbar.about') }}
            </RouterLink>
          </li>
        </ul>

        <!-- Right Side User Stats & Controls -->
        <div class="navbar-nav ms-auto">
          <div class="d-flex align-items-center flex-column flex-lg-row gap-2 gap-lg-3">

            <!-- Mobile: Stack vertically, Desktop: Horizontal -->
            <div class="d-flex align-items-center gap-2 order-lg-1">
              <!-- Chips Display -->
              <div class="stat-badge stat-badge-success">
                <i class="bi bi-wallet2 me-1"></i>
                <span class="fw-semibold">{{ userStore.formattedChips }}</span>
              </div>

              <!-- Level Display with Progress -->
              <div class="stat-badge stat-badge-info position-relative">
                <i class="bi bi-stars me-1"></i>
                <span class="fw-semibold me-2">{{ achievementStore.currentLevel.level }}</span>
                <div class="level-progress">
                  <div
                    class="level-progress-fill"
                    :style="{ width: achievementStore.levelProgress + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls Row -->
            <div class="d-flex align-items-center gap-2 order-lg-2">
              <!-- Language Selector -->
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary btn-sm d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <img
                    :src="flags[locale as Locale]"
                    :alt="locale"
                    class="flag-img me-1" />
                  <i class="bi bi-chevron-down ms-1 opacity-75"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li v-for="loc in availableLocales" :key="loc">
                    <a
                      class="dropdown-item py-2 d-flex align-items-center gap-2"
                      href="#"
                      @click.prevent="switchLanguage(loc)"
                      :class="{ 'active': locale === loc }">
                      <img :src="flags[loc]" :alt="loc" class="flag-img" />
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
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <i class="bi bi-person-circle me-1"></i>
                  <span class="d-none d-sm-inline">{{ userStore.username }}</span>
                  <i class="bi bi-chevron-down ms-1 opacity-75"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <RouterLink to="/profile" class="dropdown-item py-2">
                      <i class="bi bi-person me-2 opacity-75"></i>
                      {{ t('navbar.profile.viewProfile') }}
                    </RouterLink>
                  </li>
                  <li class="d-none d-lg-block">
                    <RouterLink to="/transactions" class="dropdown-item py-2">
                      <i class="fa fa-history me-2 opacity-75"></i>
                      {{ t('navbar.wallet.transactions') }}
                    </RouterLink>
                  </li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li>
                    <RouterLink to="/settings" class="dropdown-item py-2">
                      <i class="bi bi-gear me-2 opacity-75"></i>
                      {{ t('navbar.profile.settings') }}
                    </RouterLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <ToastContainer />
</template>

<style scoped>
/* Brand styling */
.brand-text {
  font-size: 1.1rem;
}

/* Navigation link hover effects */
.nav-link-hover {
  transition: all 0.2s ease;
  border-radius: 6px;
}

.nav-link-hover:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link-hover i {
  transition: transform 0.2s ease;
}

.nav-link-hover:hover i {
  transform: scale(1.1);
}

/* Stat badges */
.stat-badge {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-badge-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.stat-badge-info {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
  color: white;
}

/* Level progress bar */
.level-progress {
  width: 30px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.level-progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Flag images */
.flag-img {
  width: 16px;
  height: 12px;
  border-radius: 2px;
  object-fit: cover;
}

/* Button improvements */
.btn {
  border-radius: 6px;
  font-weight: 500;
}

.dropdown-toggle::after {
  display: none;
}

/* Mobile optimizations */
@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem 0 0.5rem 0;
    margin-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .navbar-nav {
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.75rem 1rem !important;
    margin: 2px 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
  }

  .stat-badge {
    justify-content: center;
    min-width: 120px;
  }

  /* Stack stats vertically on mobile */
  .d-flex.flex-column.flex-lg-row {
    align-items: stretch !important;
  }

  .d-flex.flex-column.flex-lg-row>div {
    width: 100%;
    justify-content: center;
  }
}

/* Small mobile screens */
@media (max-width: 576px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .stat-badge {
    font-size: 0.8rem;
    padding: 0.35rem 0.6rem;
  }

  .level-progress {
    width: 25px;
  }
}

/* Desktop enhancements */
@media (min-width: 992px) {
  .navbar {
    padding: 0.75rem 0;
  }

  .nav-link {
    font-weight: 500;
  }
}
</style>
