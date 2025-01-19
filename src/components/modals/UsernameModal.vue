<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  minLength: {
    type: Number,
    default: 3
  },
  maxLength: {
    type: Number,
    default: 20
  }
})

const userStore = useUserStore()
const username = ref('')
const showModal = ref(false)
const error = ref('')
const isLoading = ref(false)

const validateUsername = (value: string | null): string => {
  if (!value) return 'Username is required'
  if (value.length < props.minLength) return `Username must be at least ${props.minLength} characters`
  if (value.length > props.maxLength) return `Username cannot exceed ${props.maxLength} characters`
  if (!/^[a-zA-Z0-9_\s-]+$/.test(value)) return 'Username can only contain letters, numbers, spaces, underscores, and hyphens'
  return ''
}

const handleInput = () => {
  error.value = validateUsername(username.value)
}

const submitUsername = async () => {
  const validationError = validateUsername(username.value.trim())
  if (validationError) {
    error.value = validationError
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await userStore.updateUsername(username.value.trim())
    showModal.value = false
  } catch (err) {
    error.value = 'Failed to update username'
    console.error('Username update error:', err)
  } finally {
    isLoading.value = false
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
          :class="{ 'is-invalid': error }"
          id="username"
          v-model="username"
          @input="handleInput"
          :maxlength="maxLength"
          autocomplete="off"
          :disabled="isLoading"
          placeholder="Enter username">
        <div class="mt-1">
          <small class="text-muted" v-if="!error">
            {{ username.length }}/{{ maxLength }} characters
          </small>
          <small class="text-danger" v-if="error">
            {{ error }}
          </small>
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isLoading || !!error">
        <template v-if="isLoading">
          <span class="spinner-border spinner-border-sm me-1" role="status"></span>
          Saving...
        </template>
        <template v-else>
          Start Playing
        </template>
      </button>
    </form>
  </BaseModal>
</template>
