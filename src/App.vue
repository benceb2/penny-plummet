<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from './stores/user'
import UsernameModal from './components/UsernameModal.vue'
import Navbar from './components/Navbar.vue'

const userStore = useUserStore()
const isNavOpen = ref(false)

function handleAccountSettings() {
  // Your account settings logic
}

function handleEarnMoney() {
  // navigate to Earn
}
</script>

<template>
  <UsernameModal />
  <header>
    <Navbar :onAccountSettings="handleAccountSettings" />
  </header>
  <RouterView />
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
