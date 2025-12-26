<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import UsernameModal from '@/components/modals/UsernameModal.vue';
import ConsentModal from '@/components/modals/ConsentModal.vue';
import OfflineEarningsModal from '@/components/modals/OfflineEarningsModal.vue';
import UnsupportedBrowser from '@/components/UnsupportedBrowser.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useClickerStore } from '@/stores/clickerStore';
import { useIndexedDbSupport } from '@/composables/useIndexedDbSupport';

const clickerStore = useClickerStore();
const { status: indexedDbStatus, runCheck } = useIndexedDbSupport();

onMounted(async () => {
  const supported = await runCheck();
  if (supported) {
    // Initialize offline tracking for clicker game
    clickerStore.initializeOfflineTracking();
  }
});
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <div
      v-if="indexedDbStatus === 'checking'"
      class="d-flex align-items-center justify-content-center flex-grow-1 text-muted">
      <div class="text-center">
        <div class="spinner-border mb-3" role="status" aria-hidden="true"></div>
        <div>Checking browser support...</div>
      </div>
    </div>

    <UnsupportedBrowser v-else-if="indexedDbStatus === 'unsupported'" />

    <template v-else>
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

      <main class="flex-grow-1 pb-3">
        <RouterView />
      </main>

      <AppFooter />
    </template>
  </div>
</template>
