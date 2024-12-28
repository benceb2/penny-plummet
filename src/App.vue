<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'

const isNavOpen = ref(false)
const userBalance = ref(1000) // Starting balance
const username = ref('Player') // Could be customizable

// You could load these from localStorage on mount
onMounted(() => {
  const savedBalance = localStorage.getItem('userBalance')
  if (savedBalance) {
    userBalance.value = parseInt(savedBalance)
  }
})

// Function to update balance (could be exposed globally)
const updateBalance = (amount: number) => {
  userBalance.value += amount
  localStorage.setItem('userBalance', userBalance.value.toString())
}
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
              <i class="bi bi-coin"></i> ${{ userBalance.toLocaleString() }}
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

  <!-- Pass the balance update function to child routes -->
  <RouterView :update-balance="updateBalance" />
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