<script setup lang="ts">
import { useToastStore } from '@/stores/toast';
const toastStore = useToastStore();
</script>

<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1050">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast show"
        :class="{
          'bg-achievement': toast.type === 'achievement',
          'bg-level-up': toast.type === 'level-up'
        }"
        role="alert">
        <div class="toast-header">
          <i
            :class="['bi', toast.icon, 'me-2', {
              'text-warning': toast.type === 'achievement',
              'text-info': toast.type === 'level-up'
            }]"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="toastStore.removeToast(toast.id)"></button>
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

.bg-achievement {
  background-color: #2c3e50;
  color: white;
}

.bg-level-up {
  background-color: #2980b9;
  color: white;
}

.toast {
  min-width: 300px;
  margin-bottom: 1rem;
}
</style>
