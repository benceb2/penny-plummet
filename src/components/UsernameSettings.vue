<script setup lang="ts">
import { ref, watch } from 'vue';
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
  if (!value) return 'Username is required';
  if (value.length < props.minLength) return `Username must be at least ${props.minLength} characters`;
  if (value.length > props.maxLength) return `Username cannot exceed ${props.maxLength} characters`;
  if (!/^[a-zA-Z0-9_\s-]+$/.test(value)) return 'Username can only contain letters, numbers, spaces, underscores, and hyphens';
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
    error.value = 'Failed to update username';
    console.error('Username update error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title d-flex align-items-center">
        <i class="bi bi-person-circle me-2"></i>
        Username
      </h5>

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
                placeholder="Enter username" />
            </div>
            <div class="mt-1">
              <small class="text-muted" v-if="!error">
                {{ username?.length || 0 }}/{{ maxLength }} characters
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
              Saving...
            </template>
            <template v-else>
              <i class="bi bi-check-circle-fill me-1"></i>
              Save
            </template>
          </button>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="showSuccess" class="alert alert-success d-flex align-items-center" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        Username updated successfully!
      </div>
    </div>
  </div>
</template>
