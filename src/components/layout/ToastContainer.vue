<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore';
import { ref, onMounted, onUnmounted } from 'vue';

const toastStore = useToastStore();
const isMobile = ref(false);

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div
    class="toast-container position-fixed p-3"
    :class="{
      'top-0 start-50 translate-middle-x': isMobile,
      'top-0 end-0': !isMobile
    }"
    style="z-index: 1050; max-width: calc(100% - 2rem); padding-top: calc(var(--pp-hud-height) + .75rem) !important;">

    <TransitionGroup name="toast">
      <div
        v-for="(toast, index) in toastStore.toasts.slice(0, isMobile ? 2 : 5)"
        :key="toast.id"
        class="toast show shadow-lg"
        :class="{
          'bg-dark text-white': toast.type === 'achievement',
          'bg-primary text-white': toast.type === 'level-up',
          'toast-mobile': isMobile,
          'toast-desktop': !isMobile,
          'mb-2': isMobile,
          'mb-3': !isMobile
        }"
        role="alert"
        @click="isMobile && toastStore.removeToast(toast.id)">

        <div class="toast-header p-2 d-flex align-items-center">
          <i
            :class="['bi', toast.icon, 'me-2', {
              'text-warning': toast.type === 'achievement',
              'text-info': toast.type === 'level-up',
              'fs-5': !isMobile,
              'fs-6': isMobile
            }]">
          </i>
          <strong class="me-auto flex-grow-1">{{ toast.title }}</strong>

          
          <button
            v-if="!isMobile"
            type="button"
            class="btn-close"
            :class="{ 'btn-close-white': toast.type === 'achievement' || toast.type === 'level-up' }"
            @click.stop="toastStore.removeToast(toast.id)">
          </button>

          
          <small
            v-if="isMobile && index === 0"
            class="text-muted opacity-75 ms-2"
            style="font-size: 0.7rem;">
            tap to dismiss
          </small>
        </div>

        <div class="toast-body" :class="{ 'pb-3': isMobile }">
          {{ toast.message }}
        </div>

        
        <div
          v-if="isMobile"
          class="swipe-indicator">
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Mobile-specific toast styling */
.toast-mobile {
  width: calc(100vw - 2rem);
  max-width: 400px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Desktop toast styling */
.toast-desktop {
  min-width: 350px;
  max-width: 400px;
}

/* Swipe indicator for mobile */
.swipe-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

/* Mobile animations - slide down from top */
@media (max-width: 767px) {
  .toast-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Desktop animations - slide in from right */
@media (min-width: 768px) {
  .toast-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }

  .toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Improve touch target size on mobile */
@media (max-width: 767px) {
  .toast-header {
    min-height: 44px;
    /* iOS recommended touch target */
  }
}

/* Reduce toast count on very small screens */
@media (max-height: 600px) {
  .toast-container {
    max-height: 40vh;
    overflow-y: auto;
  }
}
</style>
