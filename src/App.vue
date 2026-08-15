<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import UsernameModal from '@/components/modals/UsernameModal.vue';
import ConsentModal from '@/components/modals/ConsentModal.vue';
import OfflineEarningsModal from '@/components/modals/OfflineEarningsModal.vue';
import UnsupportedBrowser from '@/components/UnsupportedBrowser.vue';
import AppHud from '@/components/layout/AppHud.vue';
import AppTabBar from '@/components/layout/AppTabBar.vue';
import ToastContainer from '@/components/layout/ToastContainer.vue';
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
  <div class="app-shell d-flex flex-column">
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

      <AppHud />

      <main class="app-main flex-grow-1 d-flex flex-column">
        <RouterView />
      </main>

      <AppTabBar />
      <ToastContainer />
    </template>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
}

@media (max-width: 991.98px) {
  .app-main {
    padding-bottom: calc(var(--pp-tabbar-height) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
