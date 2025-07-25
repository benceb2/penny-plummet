<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import UsernameModal from '@/components/modals/UsernameModal.vue';
import ConsentModal from '@/components/modals/ConsentModal.vue';
import OfflineEarningsModal from '@/components/modals/OfflineEarningsModal.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useClickerStore } from '@/stores/clickerStore';

const clickerStore = useClickerStore();

onMounted(async () => {
  // Initialize offline tracking for clicker game
  clickerStore.initializeOfflineTracking();
});
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <ConsentModal />
    <UsernameModal />
    <OfflineEarningsModal
      :show="clickerStore.showOfflineEarnings"
      :earnings="clickerStore.offlineEarnings"
      :timeAway="clickerStore.offlineSeconds"
      @close="clickerStore.closeOfflineEarningsModal" />
    <header>
      <AppNavbar />
    </header>

    <main class="flex-grow-1 pb-5">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
