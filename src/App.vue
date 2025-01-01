<script setup lang="ts">
import { RouterView } from 'vue-router'
import UsernameModal from './components/modals/UsernameModal.vue'
import ConsentModal from './components/modals/ConsentModal.vue'
import OfflineEarningsModal from './components/modals/OfflineEarningsModal.vue'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useClickerStore } from './stores/clicker'

const store = useClickerStore()

store.initializeOfflineTracking()
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <ConsentModal />
    <UsernameModal />
    <OfflineEarningsModal
      :show="store.showOfflineEarnings"
      :earnings="store.offlineEarnings"
      :timeAway="store.offlineSeconds"
      @close="store.closeOfflineEarningsModal" />
    <header>
      <AppNavbar />
    </header>

    <main class="flex-grow-1 pb-5">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
