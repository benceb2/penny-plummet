import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

const hasRefreshToken = () => {
  return document.cookie.includes('refreshToken=') || document.cookie.includes('refresh_token=');
};

// response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. Response is 401 Unauthorized
    // 2. We're not already trying to refresh
    // 3. We actually have a refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      hasRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        await api.post('/tokens/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear any auth state if needed
        // TODO: might want to redirect to login here or dispatch a logout action
        console.error('Token refresh failed:', refreshError);
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
