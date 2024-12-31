<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseModal from './BaseModal.vue'

const userStore = useUserStore()
const username = ref('')
const showModal = ref(false)

const submitUsername = () => {
  if (username.value.trim()) {
    userStore.updateUsername(username.value.trim())
    showModal.value = false
  }
}

watch(
  () => userStore.consented,
  (newConsented: boolean) => {
    if (newConsented && !userStore.username) {
      showModal.value = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <BaseModal
    :show="showModal"
    title="Welcome to Penny Plummet!"
    :centered="true"
    :static="true">
    <form @submit.prevent="submitUsername">
      <div class="mb-3">
        <label for="username" class="form-label">Please enter your username:</label>
        <input
          type="text"
          class="form-control"
          id="username"
          v-model="username"
          required
          minlength="2"
          maxlength="20"
          autocomplete="off"
          placeholder="Enter username">
      </div>
      <button type="submit" class="btn btn-primary" :disabled="!username.trim()">
        Start Playing
      </button>
    </form>
  </BaseModal>
</template>
