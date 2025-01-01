<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import { useUserStore } from '@/stores/user'
import { useAchievementStore } from '@/stores/achievement'
import ToastContainer from './ToastContainer.vue'

const userStore = useUserStore()
const achievementStore = useAchievementStore()
const isNavOpen = ref(false)
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-coin-fill me-2"></i>
        <i class="bi bi-graph-down-arrow me-2"></i> Penny Plummet
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

        <!-- Left Side Navigation Links -->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3"
              @click="isNavOpen = false"
              to="/blackjack">
              <i class="bi bi-suit-spade-fill me-1 transition-transform"></i>
              Blackjack
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link px-3"
              @click="isNavOpen = false"
              to="/about">
              <i class="bi bi-info-circle-fill me-1 transition-transform"></i>
              About
            </RouterLink>
          </li>
        </ul>

        <!-- Right Side User Stats & Controls -->
        <div class="d-flex align-items-center flex-column flex-lg-row gap-3">
          <!-- Chips Dropdown -->
          <div class="dropdown">
            <span
              class="badge bg-success p-2 px-3 d-flex align-items-center cursor-pointer dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="bi bi-wallet2 me-1"></i>
              {{ userStore.formattedChips }}
              <i class="bi bi-chevron-down ms-2 opacity-75"></i>
            </span>
            <ul class="dropdown-menu dropdown-menu-end min-w-200">
              <li>
                <h6 class="dropdown-header">Need more chips?</h6>
              </li>
              <li>
                <RouterLink class="dropdown-item py-2" to="/earn">
                  <i class="bi bi-piggy-bank me-2 opacity-75"></i>
                  Earn More Chips
                </RouterLink>
              </li>
              <!-- <li> TODO: Restore when store is implemented
                <hr class="dropdown-divider">
              </li>
              <li>
                <RouterLink class="dropdown-item py-2" to="/blackjack">
                  <i class="bi bi-shop me-2 opacity-75"></i>
                  Visit Store
                </RouterLink>
              </li> -->
            </ul>
          </div>

          <div class="d-flex align-items-center">
            <span class="badge bg-info p-2 position-relative d-flex align-items-center">
              <i class="bi bi-stars me-1"></i>
              {{ achievementStore.currentLevel.level }}
              <!-- Progress bar inside the badge but next to the level -->
              <div class="progress ms-2" style="width: 40px; height: 4px; background: rgba(0,0,0,0.2);">
                <div
                  class="progress-bar bg-white"
                  role="progressbar"
                  :style="{
                    width: achievementStore.levelProgress + '%',
                    transition: 'width 0.3s ease'
                  }"
                  :aria-valuenow="achievementStore.levelProgress"
                  aria-valuemin="0"
                  aria-valuemax="100">
                </div>
              </div>
            </span>
          </div>

          <!-- User Profile Group -->
          <div class="dropdown">
            <div class="d-flex align-items-center gap-2 cursor-pointer" data-bs-toggle="dropdown">
              <!-- Level Badge & Progress -->
              <!-- Username Badge -->
              <span class="badge bg-primary p-2 px-3 d-flex align-items-center">
                <i class="bi bi-person-circle me-1"></i>
                {{ userStore.username }}
                <i class="bi bi-chevron-down ms-2 opacity-75"></i>
              </span>
            </div>

            <ul class="dropdown-menu dropdown-menu-end min-w-200">
              <li>
                <RouterLink to="/settings" class="dropdown-item py-2" href="#">
                  <i class="bi bi-gear me-2 opacity-75"></i>
                  Settings
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item py-2" to="/profile">
                  <i class="bi bi-person me-2 opacity-75"></i>
                  View Profile
                </RouterLink>
              </li>
              <!--<li>
                <hr class="dropdown-divider">
              </li>
               <li>
                <a class="dropdown-item py-2 text-danger" href="#">
                  <i class="bi bi-box-arrow-right me-2 opacity-75"></i>
                  Logout
                </a>
              </li> -->
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <ToastContainer />
</template>

<style scoped>
.progress-bar {
  transition: width 0.3s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-transform {
  transition: transform 0.2s ease;
}

.nav-link:hover i {
  transform: scale(1.1);
}

.min-w-200 {
  min-width: 200px;
}

.dropdown-toggle::after {
  display: none;
}

@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem 0;
  }
}
</style>
