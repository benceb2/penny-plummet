<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from './stores/user'
import UsernameModal from './components/UsernameModal.vue'

const userStore = useUserStore()
const isNavOpen = ref(false)
</script>

<template>
  <UsernameModal />
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <!-- Brand with icon -->
        <RouterLink class="navbar-brand fw-bold" to="/">
          <i class="bi bi-coin-fill me-2"></i>
          Penny Plummet
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

        <!-- Navigation Items -->
        <div
          class="navbar-collapse"
          :class="{ 'show': isNavOpen, 'collapse': !isNavOpen }"
          id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <!-- User Stats -->
            <li class="nav-item me-lg-3 mb-2 mb-lg-0">
              <div class="d-flex gap-2">
                <span class="badge bg-primary p-2 px-3">
                  <i class="bi bi-person-circle me-1"></i>
                  {{ userStore.username }}
                </span>
                <span class="badge bg-success p-2 px-3">
                  <i class="bi bi-wallet2 me-1"></i>
                  {{ userStore.formattedChips }}
                </span>
              </div>
            </li>
            <!-- Navigation Links -->
            <li class="nav-item">
              <RouterLink
                class="nav-link px-3"
                @click="isNavOpen = false"
                to="/blackjack">
                <i class="bi bi-suit-spade-fill me-1"></i>
                Blackjack
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link px-3"
                @click="isNavOpen = false"
                to="/about">
                <i class="bi bi-info-circle-fill me-1"></i>
                About
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
@media (max-width: 991px) {
  .navbar-nav {
    padding: 1rem 0;
  }
}

.nav-link:hover i {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style>
