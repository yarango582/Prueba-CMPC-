import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
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
