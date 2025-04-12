<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { cloudSaveService } from '@/services/cloudSaveService';
import BaseModal from './BaseModal.vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'enabled', 'skipped']);

const authStore = useAuthStore();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isRegister = ref(false);
const isLoading = ref(false);
const error = ref('');
const formValid = computed(() => {
  if (!username.value || !password.value) return false;
  if (isRegister.value && password.value !== confirmPassword.value) return false;
  return true;
});

// Switch between login and register forms
const toggleForm = () => {
  isRegister.value = !isRegister.value;
  error.value = '';
};

// Handle form submission
const handleSubmit = async () => {
  if (!formValid.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    if (isRegister.value) {
      // Register new account
      await authStore.register(username.value, password.value);
      // After registration, log in
      const success = await authStore.login(username.value, password.value);
      if (success) {
        // Update the username in userStore to match the account
        userStore.updateUsername(username.value);
        await handleCloudSaveSetup();
      }
    } else {
      // Login to existing account
      const success = await authStore.login(username.value, password.value);
      if (success) {
        // If the username from the server differs from the local one,
        // update the local username to match
        if (authStore.currentUser?.username &&
          authStore.currentUser.username !== userStore.username) {
          userStore.updateUsername(authStore.currentUser.username);
        }
        await handleCloudSaveSetup();
      }
    }
  } catch (err: any) {
    error.value = err.response?.data || (isRegister.value ? 'Registration failed' : 'Login failed');
  } finally {
    isLoading.value = false;
  }
};

// Skip cloud saves
const skipCloudSaves = () => {
  emit('skipped');
  emit('close');
};

// Handle cloud save setup after successful login
const handleCloudSaveSetup = async () => {
  // Compare local and cloud saves
  const comparison = await cloudSaveService.compareCloudAndLocalSaves();

  if (comparison.hasCloud && comparison.cloudNewer) {
    // If cloud save is newer, ask user if they want to load it
    const loadCloud = confirm(
      'We found a newer save in the cloud. Load it instead of your local save?'
    );

    if (loadCloud) {
      await cloudSaveService.loadFromCloud();
    } else {
      // If not, save local to cloud
      await cloudSaveService.saveToCloud();
    }
  } else {
    // If no cloud save or local is newer, save local to cloud
    await cloudSaveService.saveToCloud();
  }

  // Start auto-save
  cloudSaveService.startAutoSave();

  // Emit events
  emit('enabled');
  emit('close');
};
</script>

<template>
  <BaseModal
    :show="show"
    title="Enable Cloud Saves"
    :centered="true"
    @close="skipCloudSaves">
    <div>
      <p class="mb-3">
        Cloud saves allow you to:
      </p>
      <ul class="mb-4">
        <li>Sync your progress across devices</li>
        <li>Keep your progress safe if your browser data is cleared</li>
        <li>Participate in global leaderboards</li>
      </ul>

      <form @submit.prevent="handleSubmit" class="mb-4">
        <h5 class="mb-3">{{ isRegister ? 'Create Account' : 'Sign In' }}</h5>

        <!-- Username field -->
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input
            type="text"
            class="form-control"
            id="username"
            v-model="username"
            required
            autocomplete="username"
            :disabled="isLoading">
        </div>

        <!-- Password field -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            required
            autocomplete="current-password"
            :disabled="isLoading">
        </div>

        <!-- Confirm Password (only for register) -->
        <div class="mb-3" v-if="isRegister">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            autocomplete="new-password"
            :disabled="isLoading">
          <div class="form-text text-danger" v-if="confirmPassword && password !== confirmPassword">
            Passwords don't match
          </div>
        </div>

        <!-- Error message -->
        <div class="alert alert-danger" v-if="error">
          {{ error }}
        </div>

        <!-- Submit button -->
        <div class="d-grid gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!formValid || isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isRegister ? 'Create Account' : 'Sign In' }}
          </button>
        </div>
      </form>

      <!-- Toggle between login/register -->
      <div class="text-center mb-4">
        <button type="button" class="btn btn-link" @click="toggleForm">
          {{ isRegister ? 'Already have an account? Sign in' : 'Don\'t have an account? Create one' }}
        </button>
      </div>

      <!-- Skip button -->
      <div class="text-center">
        <button type="button" class="btn btn-outline-secondary" @click="skipCloudSaves">
          Maybe Later
        </button>
      </div>
    </div>
  </BaseModal>
</template>
