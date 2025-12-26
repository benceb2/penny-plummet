<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const validateUsername = (value: string | null): string => {
  if (!value) return t('usernameSettings.validation.required')
  if (value.length < props.minLength) return t('usernameSettings.validation.minLength', { min: props.minLength })
  if (value.length > props.maxLength) return t('usernameSettings.validation.maxLength', { max: props.maxLength })
  if (!/^[a-zA-Z0-9_\s-]+$/.test(value)) return t('usernameSettings.validation.invalidCharacters')
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
    error.value = t('usernameSettings.updateFailed')
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
    :title="t('usernameModal.title')"
    :centered="true"
    :static="true">
    <form @submit.prevent="submitUsername">
      <div class="mb-3">
        <label for="username" class="form-label">{{ t('usernameModal.prompt') }}</label>
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
          :placeholder="t('usernameSettings.placeholder')">
        <div class="mt-1">
          <small class="text-muted" v-if="!error">
            {{ t('usernameSettings.charactersCount', { current: username.length, max: maxLength }) }}
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
          <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          {{ t('usernameSettings.saving') }}
        </template>
        <template v-else>
          {{ t('usernameModal.startPlaying') }}
        </template>
      </button>
    </form>
  </BaseModal>
</template>
