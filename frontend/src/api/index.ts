import axios, { AxiosInstance } from 'axios';

const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username: string, password: string) =>
    request.post('/auth/login', { username, password }),
  getProfile: () => request.get('/auth/profile'),
  getUsers: () => request.get('/auth/users'),
};

export const suppliers = {
  create: (data: any) => request.post('/suppliers', data),
  list: (params?: any) => request.get('/suppliers', { params }),
  get: (id: string) => request.get(`/suppliers/${id}`),
  update: (id: string, data: any) => request.put(`/suppliers/${id}`, data),
  remove: (id: string) => request.delete(`/suppliers/${id}`),
};

export const ingredientBatches = {
  create: (data: any) => request.post('/ingredient-batches', data),
  list: (params?: any) => request.get('/ingredient-batches', { params }),
  get: (id: string) => request.get(`/ingredient-batches/${id}`),
  update: (id: string, data: any) => request.put(`/ingredient-batches/${id}`, data),
  remove: (id: string) => request.delete(`/ingredient-batches/${id}`),
  getExpiring: () => request.get('/ingredient-batches/alert/expiring'),
};

export const recipes = {
  create: (data: any) => request.post('/recipes', data),
  list: (params?: any) => request.get('/recipes', { params }),
  getByDate: (date: string) => request.get(`/recipes/by-date/${date}`),
  get: (id: string) => request.get(`/recipes/${id}`),
  update: (id: string, data: any) => request.put(`/recipes/${id}`, data),
  remove: (id: string) => request.delete(`/recipes/${id}`),
};

export const samples = {
  create: (data: any) => request.post('/samples', data),
  list: (params?: any) => request.get('/samples', { params }),
  get: (id: string) => request.get(`/samples/${id}`),
  update: (id: string, data: any) => request.put(`/samples/${id}`, data),
  remove: (id: string) => request.delete(`/samples/${id}`),
  destroy: (id: string) => request.post(`/samples/${id}/destroy`),
  getExpired: () => request.get('/samples/alert/expired'),
};

export const classroomMeals = {
  create: (data: any) => request.post('/classroom-meals', data),
  list: (params?: any) => request.get('/classroom-meals', { params }),
  get: (id: string) => request.get(`/classroom-meals/${id}`),
  update: (id: string, data: any) => request.put(`/classroom-meals/${id}`, data),
  remove: (id: string) => request.delete(`/classroom-meals/${id}`),
  getAllergyRisks: (date: string) => request.get(`/classroom-meals/alert/allergies/${date}`),
};

export const escortReviews = {
  create: (data: any) => request.post('/escort-reviews', data),
  list: (params?: any) => request.get('/escort-reviews', { params }),
  get: (id: string) => request.get(`/escort-reviews/${id}`),
  update: (id: string, data: any) => request.put(`/escort-reviews/${id}`, data),
  remove: (id: string) => request.delete(`/escort-reviews/${id}`),
  getStatistics: (date?: string) =>
    request.get('/escort-reviews/statistics', { params: date ? { date } : {} }),
};

export const rectifications = {
  create: (data: any) => request.post('/rectifications', data),
  list: (params?: any) => request.get('/rectifications', { params }),
  get: (id: string) => request.get(`/rectifications/${id}`),
  update: (id: string, data: any) => request.put(`/rectifications/${id}`, data),
  remove: (id: string) => request.delete(`/rectifications/${id}`),
  getPendingCount: () => request.get('/rectifications/pending-count'),
};

export const alerts = {
  create: (data: any) => request.post('/alerts', data),
  list: (status?: string) =>
    request.get('/alerts', { params: status ? { status } : {} }),
  get: (id: string) => request.get(`/alerts/${id}`),
  update: (id: string, data: any) => request.put(`/alerts/${id}`, data),
  resolve: (id: string) => request.post(`/alerts/${id}/resolve`),
  remove: (id: string) => request.delete(`/alerts/${id}`),
  getActiveCount: () => request.get('/alerts/active-count'),
};

export default request;
