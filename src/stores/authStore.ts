import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer';

export interface User {
  id: string;
  username: string;
  lastLogin?: string;
  lastSave?: string;
  createdAt: string;
}

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false);
  const error = ref('');
  const currentUser = ref<User | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!currentUser.value);
  const loggedIn = computed(() => isAuthenticated.value);

  // Actions
  async function register(username: string, password: string) {
    isLoading.value = true;
    error.value = '';

    try {
      const response = await api.post('/players', { username, password });
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(username: string, password: string) {
    isLoading.value = true;
    error.value = '';

    try {
      await api.post('/tokens', { username, password });
      await fetchUserData();
      return true;
    } catch (err: any) {
      error.value = err.response?.data || 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await api.delete('/tokens');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      currentUser.value = null;
    }
  }

  async function fetchUserData() {
    isLoading.value = true;
    try {
      const response = await api.get('/players/me');
      currentUser.value = response.data;
      return currentUser.value;
    } catch (err: any) {
      error.value = err.response?.data || 'Failed to fetch user data';
      if (err.response?.status === 401) {
        currentUser.value = null;
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function checkAuth() {
    try {
      await fetchUserData();
      return !!currentUser.value;
    } catch (err) {
      console.error('Error checking auth:', err);
      return false;
    }
  }

  return {
    isLoading,
    error,
    currentUser,
    isAuthenticated,
    loggedIn,
    register,
    login,
    logout,
    fetchUserData,
    checkAuth
  };
}, {
  persist: {
    key: calculateStorageKey("auth-store"),
    serializer: createGameSerializer(),
    paths: ['currentUser']
  }
} as any);
