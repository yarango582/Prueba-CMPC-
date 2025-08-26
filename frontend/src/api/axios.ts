import axios from 'axios';

const apiBase = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL ?? '/api';

const instance = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor simple para refresh token placeholder
instance.interceptors.response.use(
  (r) => r,
  async (error) => {
    // Could implement refresh token flow here
    return Promise.reject(error);
  },
);

export default instance;
