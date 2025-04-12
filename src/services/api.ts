import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already trying to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/tokens/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, just return the error
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Game save service - export separately
export const saveService = {
  async saveGame(saveData: any) {
    return api.post('/saves', saveData);
  },

  async loadGame() {
    return api.get('/saves/latest');
  },

  async listSaves() {
    return api.get('/saves');
  },

  async deleteSave(saveId: string) {
    return api.delete(`/saves/${saveId}`);
  }
};

export default api;
