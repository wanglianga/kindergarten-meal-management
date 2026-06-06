import axios from 'axios';
import type {
  Supplier,
  IngredientBatch,
  Recipe,
  Sample,
  ClassroomMeal,
  EscortReview,
  Rectification,
  Alert,
  User,
  UserRole,
  CreateSupplierDto,
  CreateIngredientBatchDto,
  CreateRecipeDto,
  CreateSampleDto,
  CreateClassroomMealDto,
  CreateEscortReviewDto,
  CreateRectificationDto,
  CreateAlertDto,
  AllergyRiskResult,
  EscortReviewStatistics,
  RecipeByDate,
  PaginatedResult,
  AllergyChild,
  CreateAllergyChildDto,
  AllergenSummary,
  MealDistribution,
  CreateMealDistributionDto,
  DistributionChecklist,
  RiskStatistics,
} from '@/types';

export type {
  Supplier,
  IngredientBatch,
  Recipe,
  Sample,
  ClassroomMeal,
  EscortReview,
  Rectification,
  Alert,
  User,
  UserRole,
  CreateSupplierDto,
  CreateIngredientBatchDto,
  CreateRecipeDto,
  CreateSampleDto,
  CreateClassroomMealDto,
  CreateEscortReviewDto,
  CreateRectificationDto,
  CreateAlertDto,
  AllergyRiskResult,
  EscortReviewStatistics,
  RecipeByDate,
  PaginatedResult,
  AllergyChild,
  CreateAllergyChildDto,
  AllergenSummary,
  MealDistribution,
  CreateMealDistributionDto,
  DistributionChecklist,
  RiskStatistics,
};

export interface ListParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: User;
}

export interface CountResponse {
  count: number;
}

const request = axios.create({
  baseURL: '/api',
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
  login: (username: string, password: string): Promise<LoginResponse> =>
    request.post('/auth/login', { username, password }),
  getProfile: (): Promise<User> => request.get('/auth/profile'),
  getUsers: (): Promise<User[]> => request.get('/auth/users'),
};

export const suppliers = {
  create: (data: CreateSupplierDto): Promise<Supplier> =>
    request.post('/suppliers', data),
  list: (params?: ListParams): Promise<PaginatedResult<Supplier>> =>
    request.get('/suppliers', { params }),
  getAll: (params?: ListParams): Promise<PaginatedResult<Supplier>> =>
    request.get('/suppliers', { params }),
  get: (id: number): Promise<Supplier> => request.get(`/suppliers/${id}`),
  update: (id: number, data: Partial<CreateSupplierDto>): Promise<Supplier> =>
    request.put(`/suppliers/${id}`, data),
  remove: (id: number): Promise<void> => request.delete(`/suppliers/${id}`),
  delete: (id: number): Promise<void> => request.delete(`/suppliers/${id}`),
};

export const ingredientBatches = {
  create: (data: CreateIngredientBatchDto): Promise<IngredientBatch> =>
    request.post('/ingredient-batches', data),
  list: (params?: ListParams): Promise<PaginatedResult<IngredientBatch>> =>
    request.get('/ingredient-batches', { params }),
  getAll: (params?: ListParams): Promise<PaginatedResult<IngredientBatch>> =>
    request.get('/ingredient-batches', { params }),
  get: (id: number): Promise<IngredientBatch> =>
    request.get(`/ingredient-batches/${id}`),
  update: (
    id: number,
    data: Partial<CreateIngredientBatchDto>
  ): Promise<IngredientBatch> => request.put(`/ingredient-batches/${id}`, data),
  remove: (id: number): Promise<void> =>
    request.delete(`/ingredient-batches/${id}`),
  delete: (id: number): Promise<void> =>
    request.delete(`/ingredient-batches/${id}`),
  getExpiring: (): Promise<IngredientBatch[]> =>
    request.get('/ingredient-batches/alert/expiring'),
};

export const recipes = {
  create: (data: CreateRecipeDto): Promise<Recipe> =>
    request.post('/recipes', data),
  list: (params?: ListParams): Promise<PaginatedResult<Recipe>> =>
    request.get('/recipes', { params }),
  findByDate: (date: string, className?: string): Promise<RecipeByDate> =>
    request.get(`/recipes/by-date/${date}`, { params: className ? { className } : {} }),
  getByDate: (date: string, className?: string): Promise<RecipeByDate> =>
    request.get(`/recipes/by-date/${date}`, { params: className ? { className } : {} }),
  get: (id: number): Promise<Recipe> => request.get(`/recipes/${id}`),
  update: (id: number, data: Partial<CreateRecipeDto>): Promise<Recipe> =>
    request.put(`/recipes/${id}`, data),
  remove: (id: number): Promise<void> => request.delete(`/recipes/${id}`),
};

export const samples = {
  create: (data: CreateSampleDto): Promise<Sample> =>
    request.post('/samples', data),
  list: (params?: ListParams): Promise<PaginatedResult<Sample>> =>
    request.get('/samples', { params }),
  get: (id: number): Promise<Sample> => request.get(`/samples/${id}`),
  update: (id: number, data: Partial<CreateSampleDto>): Promise<Sample> =>
    request.put(`/samples/${id}`, data),
  remove: (id: number): Promise<void> => request.delete(`/samples/${id}`),
  destroy: (id: number): Promise<Sample> =>
    request.post(`/samples/${id}/destroy`),
  getExpired: (): Promise<Sample[]> => request.get('/samples/alert/expired'),
};

export const classroomMeals = {
  create: (data: CreateClassroomMealDto): Promise<ClassroomMeal> =>
    request.post('/classroom-meals', data),
  list: (params?: ListParams): Promise<PaginatedResult<ClassroomMeal>> =>
    request.get('/classroom-meals', { params }),
  get: (id: number): Promise<ClassroomMeal> =>
    request.get(`/classroom-meals/${id}`),
  update: (
    id: number,
    data: Partial<CreateClassroomMealDto>
  ): Promise<ClassroomMeal> => request.put(`/classroom-meals/${id}`, data),
  remove: (id: number): Promise<void> =>
    request.delete(`/classroom-meals/${id}`),
  getAllergyRisks: (date: string): Promise<AllergyRiskResult> =>
    request.get(`/classroom-meals/alert/allergies/${date}`),
};

export const escortReviews = {
  create: (data: CreateEscortReviewDto): Promise<EscortReview> =>
    request.post('/escort-reviews', data),
  list: (params?: ListParams): Promise<PaginatedResult<EscortReview>> =>
    request.get('/escort-reviews', { params }),
  get: (id: number): Promise<EscortReview> =>
    request.get(`/escort-reviews/${id}`),
  update: (
    id: number,
    data: Partial<CreateEscortReviewDto>
  ): Promise<EscortReview> => request.put(`/escort-reviews/${id}`, data),
  remove: (id: number): Promise<void> =>
    request.delete(`/escort-reviews/${id}`),
  getStatistics: (date?: string): Promise<EscortReviewStatistics> =>
    request.get('/escort-reviews/statistics', { params: date ? { date } : {} }),
};

export const rectifications = {
  create: (data: CreateRectificationDto): Promise<Rectification> =>
    request.post('/rectifications', data),
  list: (params?: ListParams): Promise<PaginatedResult<Rectification>> =>
    request.get('/rectifications', { params }),
  get: (id: number): Promise<Rectification> =>
    request.get(`/rectifications/${id}`),
  update: (
    id: number,
    data: Partial<CreateRectificationDto>
  ): Promise<Rectification> => request.put(`/rectifications/${id}`, data),
  remove: (id: number): Promise<void> =>
    request.delete(`/rectifications/${id}`),
  getPendingCount: (): Promise<CountResponse> =>
    request.get('/rectifications/pending-count'),
};

export const alerts = {
  create: (data: CreateAlertDto): Promise<Alert> =>
    request.post('/alerts', data),
  list: (status?: string): Promise<Alert[]> =>
    request.get('/alerts', { params: status ? { status } : {} }),
  get: (id: number): Promise<Alert> => request.get(`/alerts/${id}`),
  update: (id: number, data: Partial<CreateAlertDto>): Promise<Alert> =>
    request.put(`/alerts/${id}`, data),
  resolve: (id: number): Promise<Alert> =>
    request.post(`/alerts/${id}/resolve`),
  remove: (id: number): Promise<void> => request.delete(`/alerts/${id}`),
  getActiveCount: (): Promise<CountResponse> =>
    request.get('/alerts/active-count'),
};

export const allergyChildren = {
  create: (data: CreateAllergyChildDto): Promise<AllergyChild> =>
    request.post('/allergy-children', data),
  list: (params?: ListParams): Promise<PaginatedResult<AllergyChild>> =>
    request.get('/allergy-children', { params }),
  findByClassName: (className: string): Promise<AllergyChild[]> =>
    request.get(`/allergy-children/by-class/${className}`),
  getSummary: (className?: string): Promise<AllergenSummary> =>
    request.get('/allergy-children/summary', { params: className ? { className } : {} }),
  get: (id: number): Promise<AllergyChild> =>
    request.get(`/allergy-children/${id}`),
  update: (
    id: number,
    data: Partial<CreateAllergyChildDto>
  ): Promise<AllergyChild> => request.put(`/allergy-children/${id}`, data),
  remove: (id: number): Promise<void> =>
    request.delete(`/allergy-children/${id}`),
};

export const mealDistributions = {
  create: (data: CreateMealDistributionDto): Promise<MealDistribution> =>
    request.post('/meal-distributions', data),
  list: (params?: ListParams): Promise<PaginatedResult<MealDistribution>> =>
    request.get('/meal-distributions', { params }),
  getChecklist: (
    date: string,
    className: string,
    mealType: string
  ): Promise<DistributionChecklist> =>
    request.get('/meal-distributions/checklist', {
      params: { date, className, mealType },
    }),
  getRiskStatistics: (date?: string): Promise<RiskStatistics> =>
    request.get('/meal-distributions/risk-statistics', {
      params: date ? { date } : {},
    }),
  get: (id: number): Promise<MealDistribution> =>
    request.get(`/meal-distributions/${id}`),
  update: (
    id: number,
    data: Partial<CreateMealDistributionDto>
  ): Promise<MealDistribution> =>
    request.put(`/meal-distributions/${id}`, data),
  confirm: (id: number, confirmedBy: string): Promise<MealDistribution> =>
    request.post(`/meal-distributions/${id}/confirm`, { confirmedBy }),
  remove: (id: number): Promise<void> =>
    request.delete(`/meal-distributions/${id}`),
};

export default request;
