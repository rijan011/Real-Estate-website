import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/user/me'),
};

export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  getById: (id) => api.get(`/properties/${id}`),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (propertyId) => api.post('/favorites', { propertyId }),
  remove: (propertyId) => api.delete(`/favorites/${propertyId}`),
  check: (propertyId) => api.get(`/favorites/check/${propertyId}`),
};

export default api;
