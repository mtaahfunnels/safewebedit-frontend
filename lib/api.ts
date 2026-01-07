import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API modules
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    // Store token in localStorage
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const googleSheetsAPI = {
  getSettings: async () => {
    const response = await api.get('/api/google-sheets/settings');
    return response.data;
  },
  testConnection: async (google_sheet_url: string) => {
    const response = await api.post('/api/google-sheets/test-connection', { google_sheet_url });
    return response.data;
  },
  saveSettings: async (data: { google_sheet_url: string; syncEnabled: boolean }) => {
    const response = await api.post('/api/google-sheets/settings', data);
    return response.data;
  },
};
