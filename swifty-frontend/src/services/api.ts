import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authService = {
  register: (name: string, email: string, password: string, phone: string) =>
    api.post('/auth/register', { name, email, password, phone }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  verify: () => api.post('/auth/verify'),
};

// Restaurants
export const restaurantService = {
  getAll: () => api.get('/restaurants'),
  search: (query: string) => api.get(`/restaurants/search?query=${query}`),
  getById: (id: string) => api.get(`/restaurants/${id}`),
};

// Menus
export const menuService = {
  getByRestaurant: (restaurantId: string) =>
    api.get(`/menus/restaurant/${restaurantId}`),
  getById: (id: string) => api.get(`/menus/${id}`),
};

// Orders
export const orderService = {
  create: (userId: string, restaurantId: string, items: any[], totalPrice: number, deliveryAddress: string) =>
    api.post('/orders', { userId, restaurantId, items, totalPrice, deliveryAddress }),
  getUserOrders: (userId: string) => api.get(`/orders/user/${userId}`),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}`, { status }),
};

export default api;
