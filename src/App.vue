<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { RouterView } from 'vue-router';
import UsernameModal from '@/components/modals/UsernameModal.vue';
import ConsentModal from '@/components/modals/ConsentModal.vue';
import OfflineEarningsModal from '@/components/modals/OfflineEarningsModal.vue';
import CloudSaveModal from '@/components/modals/CloudSaveModal.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useClickerStore } from '@/stores/clickerStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { cloudSaveService } from '@/services/cloudSaveService';

const clickerStore = useClickerStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// State for initial cloud save prompt
const showCloudSavePrompt = ref(false);

// Determine if we should show the cloud save prompt
// Only show if:
// 1. User has consented to cookies
// 2. User has set a username
// 3. User is not already authenticated
// 4. User hasn't seen the prompt before
const shouldShowCloudSavePrompt = computed(() => {
  return userStore.consented &&
    userStore.username &&
    !authStore.isAuthenticated &&
    !userStore.hasSeenCloudSavePrompt;
});

// Handle cloud save enabled
const handleCloudSaveEnabled = () => {
  markPromptAsSeen();
  cloudSaveService.startAutoSave();
};

// Handle cloud save skipped
const handleCloudSaveSkipped = () => {
  markPromptAsSeen();
};

// Mark cloud save prompt as seen
const markPromptAsSeen = () => {
  userStore.markCloudSavePromptAsSeen();
  showCloudSavePrompt.value = false;
};

// Watch for authentication status changes
watch(() => authStore.isAuthenticated, (newValue) => {
  if (newValue) {
    // Start auto-save when authenticated
    cloudSaveService.startAutoSave();
  } else {
    // Stop auto-save when not authenticated
    cloudSaveService.stopAutoSave();
  }
});

// Initialize
onMounted(async () => {
  // Initialize offline tracking for clicker game
  clickerStore.initializeOfflineTracking();

  // Check authentication status and start auto-save if logged in
  await authStore.checkAuth();

  // Show cloud save prompt after a delay if conditions are met
  setTimeout(() => {
    if (shouldShowCloudSavePrompt.value) {
      showCloudSavePrompt.value = true;
    }
  }, 5000); // 5 seconds delay
});
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <ConsentModal />
    <UsernameModal />
    <CloudSaveModal
      :show="showCloudSavePrompt"
      @close="markPromptAsSeen"
      @enabled="handleCloudSaveEnabled"
      @skipped="handleCloudSaveSkipped" />
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
