<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore';
const toastStore = useToastStore();
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1050">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast show shadow-lg mb-3"
        :class="{
          'bg-dark text-white': toast.type === 'achievement',
          'bg-primary text-white': toast.type === 'level-up'
        }"
        role="alert"
        style="min-width: 350px">
        <div class="toast-header p-2">
          <i
            :class="['bi', toast.icon, 'me-2 fs-5', {
              'text-warning': toast.type === 'achievement',
              'text-info': toast.type === 'level-up'
            }]">
          </i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            :class="{ 'btn-close-white': toast.type === 'achievement' || toast.type === 'level-up' }"
            @click="toastStore.removeToast(toast.id)">
          </button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast {
  min-width: 350px;
  margin-bottom: 1rem;
}
</style>
