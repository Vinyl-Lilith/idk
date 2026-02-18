import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-and-stuff.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const sensorAPI = {
  getLatest: () => api.get('/sensors/latest'),
  get24Hours: () => api.get('/sensors/24h'),
  getByDate: (date) => api.get(`/sensors/date/${date}`),
  exportExcel: (date) => api.get(`/sensors/export/excel?date=${date}`, { responseType: 'blob' }),
  getEvents24h: () => api.get('/sensors/events/24h'),
};

export const thresholdAPI = {
  get: () => api.get('/thresholds'),
  update: (data) => api.put('/thresholds', data),
};

export const manualAPI = {
  control: (data) => api.post('/manual/control', data),
  resumeAuto: () => api.post('/manual/auto'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getOnlineUsers: () => api.get('/admin/users/online'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  banUser: (id, banned) => api.put(`/admin/users/${id}/ban`, { banned }),
  restrictUser: (id, restricted) => api.put(`/admin/users/${id}/restrict`, { restricted }),
  promoteUser: (id) => api.put(`/admin/users/${id}/promote`),
  demoteUser: (id) => api.put(`/admin/users/${id}/demote`),
  getActivity24h: () => api.get('/admin/activity/24h'),
  getPendingPasswordRequests: () => api.get('/admin/forgot-password/pending'),
  approvePasswordRequest: (id, newPassword) => api.post(`/admin/forgot-password/${id}/approve`, { newPassword }),
  rejectPasswordRequest: (id) => api.post(`/admin/forgot-password/${id}/reject`),
  getAlerts: () => api.get('/admin/alerts'),
  acknowledgeAlert: (id) => api.put(`/admin/alerts/${id}/acknowledge`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  updateUsername: (newUsername) => api.put('/settings/username', { newUsername }),
  updateTheme: (theme) => api.put('/settings/theme', { theme }),
};

export default api;
