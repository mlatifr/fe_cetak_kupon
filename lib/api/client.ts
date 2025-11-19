import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (untuk menambahkan token jika ada)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Tambahkan token dari auth store jika diperlukan
    // const token = useAuthStore.getState().token;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (untuk handle error global)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error untuk debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle error global di sini
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized - redirect ke login
    }

    // Handle network error
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('Backend tidak dapat dijangkau. Pastikan backend berjalan di', API_BASE_URL);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

