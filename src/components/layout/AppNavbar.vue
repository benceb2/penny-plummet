# Navbar.vue
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const isNavOpen = ref(false)
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-coin-fill me-2"></i>
        <i class="bi bi-graph-down-arrow me-2"></i> Penny Plummet
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        @click="isNavOpen = !isNavOpen"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        class="navbar-collapse"
        :class="{ 'show': isNavOpen, 'collapse': !isNavOpen }"
        id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center py-3 py-lg-0">
          <li class="nav-item me-3">
            <RouterLink
              class="nav-link px-3"
              @click="isNavOpen = false"
              to="/blackjack">
              <i class="bi bi-suit-spade-fill me-1 transition-transform"></i>
              Blackjack
            </RouterLink>
          </li>
          <li class="nav-item me-3">
            <RouterLink
              class="nav-link px-3"
              @click="isNavOpen = false"
              to="/about">
              <i class="bi bi-info-circle-fill me-1 transition-transform"></i>
              About
            </RouterLink>
          </li>

          <li class="nav-item me-lg-3 mb-2 mb-lg-0 me-3">
            <div class="d-flex gap-2">
              <!-- Chips Dropdown -->
              <div class="dropdown me-3">
                <span
                  class="badge bg-success p-2 px-3 d-flex align-items-center cursor-pointer dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <i class="bi bi-wallet2 me-1"></i>
                  {{ userStore.formattedChips }}
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
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li>
                    <RouterLink class="dropdown-item py-2" to="/blackjack">
                      <i class="bi bi-shop me-2 opacity-75"></i>
                      Visit Store
                    </RouterLink>
                  </li>
                </ul>
              </div>

              <!-- Username Dropdown -->
              <div class="dropdown">
                <span
                  class="badge bg-primary ms-2 p-2 px-3 d-flex align-items-center cursor-pointer dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <i class="bi bi-person-circle me-1"></i>
                  {{ userStore.username }}
                </span>
                <ul class="dropdown-menu dropdown-menu-end min-w-200">
                  <li>
                    <a class="dropdown-item py-2" href="#">
                      <i class="bi bi-gear me-2 opacity-75"></i>
                      Account Settings
                    </a>
                  </li>
                  <li>
                    <RouterLink class="dropdown-item py-2" to="/blackjack">
                      <i class="bi bi-person me-2 opacity-75"></i>
                      View Profile
                    </RouterLink>
                  </li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li>
                    <a class="dropdown-item py-2 text-danger" href="#">
                      <i class="bi bi-box-arrow-right me-2 opacity-75"></i>
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.transition-transform {
  transition: transform 0.2s ease;
}

.nav-link:hover i {
  transform: scale(1.1);
  cursor: pointer;
}

.min-w-200 {
  min-width: 200px;
}
</style>
