<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from './stores/user';

const userStore = useUserStore()

const isNavOpen = ref(false)
const username = ref('Player')
</script>

<template>
  <header>
    <div class="d-flex align-items-center justify-content-center">
      <nav class="navbar navbar-expand-lg bg-body-tertiary w-100">
        <div class="container-fluid">
          <RouterLink class="navbar-brand" to="/">Penny Plummet</RouterLink>

          <!-- User Stats Section -->
          <div class="user-stats me-3">
            <span class="badge bg-success me-2">
              <i class="bi bi-person"></i> {{ username }}
            </span>
            <span class="badge bg-primary">
              <i class="bi bi-coin"></i> {{ userStore.formattedChips }}
            </span>
          </div>

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
            <ul class="navbar-nav">
              <li class="nav-item">
                <RouterLink class="nav-link" @click="isNavOpen = false" to="/blackjack">Blackjack</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" @click="isNavOpen = false" to="/about">About</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.user-stats {
  font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-stats {
    order: -1;
    width: 100%;
    margin-bottom: 1rem;
    text-align: center;
  }
}
</style>
