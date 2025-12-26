<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  minLength: {
    type: Number,
    default: 3
  },
  maxLength: {
    type: Number,
    default: 20
  }
});

// i18n
const { t } = useI18n();

const userStore = useUserStore();
const username = ref(userStore.username);
const error = ref('');
const isLoading = ref(false);
const showSuccess = ref(false);
const isDirty = ref(false);

// Watch for external username changes
watch(() => userStore.username, (newValue) => {
  if (newValue !== username.value && !isDirty.value) {
    username.value = newValue;
  }
});

const validateUsername = (value: string | null): string => {
  if (!value) return t('usernameSettings.validation.required');
  if (value.length < props.minLength) return t('usernameSettings.validation.minLength', { min: props.minLength });
  if (value.length > props.maxLength) return t('usernameSettings.validation.maxLength', { max: props.maxLength });
  if (!/^[a-zA-Z0-9_\s-]+$/.test(value)) return t('usernameSettings.validation.invalidCharacters');
  return '';
};

const handleInput = () => {
  isDirty.value = username.value !== userStore.username;
  error.value = validateUsername(username.value);
};

const updateUsername = async () => {
  const validationError = validateUsername(username.value);
  if (validationError) {
    error.value = validationError;
    return;
  }

  if (username.value === userStore.username) {
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    if (!username.value) { return; }
    userStore.updateUsername(username.value);
    showSuccess.value = true;
    isDirty.value = false;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (err) {
    error.value = t('usernameSettings.updateFailed');
    console.error('Username update error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="card mb-4">
    <div class="card-body">
      <h2 class="card-title d-flex align-items-center h5">
        <i class="bi bi-person-circle me-2"></i>
        {{ t('usernameSettings.title') }}
      </h2>
      <div class="mb-3 mt-3">
        <div class="d-flex gap-3">
          <div class="flex-grow-1">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                :class="{
                  'is-invalid': error,
                  'border-warning': isDirty && !error
                }"
                v-model="username"
                @input="handleInput"
                :disabled="isLoading"
                :maxlength="maxLength"
                :placeholder="t('usernameSettings.placeholder')" />
            </div>
            <div class="mt-1">
              <small class="text-muted" v-if="!error">
                {{ t('usernameSettings.charactersCount', { current: username?.length || 0, max: maxLength }) }}
              </small>
              <small class="text-danger" v-if="error">
                {{ error }}
              </small>
            </div>
          </div>
          <button
            class="btn h-100"
            :class="{
              'btn-outline-primary': !isLoading && !error && isDirty,
              'btn-outline-secondary': !isDirty || error,
            }"
            @click="updateUsername"
            :disabled="isLoading || !!error || !isDirty">
            <template v-if="isLoading">
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ t('usernameSettings.saving') }}
            </template>
            <template v-else>
              <i class="bi bi-check-circle-fill me-1"></i>
              {{ t('usernameSettings.save') }}
            </template>
          </button>
        </div>
      </div>
      <!-- Success Alert -->
      <div v-if="showSuccess" class="alert alert-success d-flex align-items-center" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ t('usernameSettings.updateSuccess') }}
      </div>
    </div>
  </div>
</template>
