import type { ReactNode } from 'react';

export type UserRole = 'logistics' | 'teacher' | 'parent' | 'regulator';

export interface User {
  id: number;
  username: string;
  realName: string;
  name?: string;
  role: UserRole;
  phone?: string;
  className?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
  path: string;
}

export interface Dish {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  description?: string;
  ingredients?: string[];
  allergens?: string[];
}

export interface RetentionSample {
  id: string;
  sampleBoxNo: string;
  dishName: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  retentionTime: string;
  status: 'normal' | 'abnormal' | 'destroyed';
  photoUrl?: string;
  operator: string;
  remark?: string;
}

export interface MealEvaluation {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  rating: number;
  tasteRating: number;
  hygieneRating: number;
  nutritionRating: number;
  photoUrl?: string;
  suggestion?: string;
  evaluator: string;
  evaluatorRole: string;
  createdAt: string;
}

export interface RectificationOrder {
  id: string;
  orderNo: string;
  problemType: string;
  description: string;
  source: string;
  status: 'pending' | 'processing' | 'completed';
  measures: string;
  responsiblePerson: string;
  deadline: string;
  createdAt: string;
  completedAt?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  businessLicense?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientBatch {
  id: number;
  batchNumber: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  supplierId: number;
  supplier?: Supplier;
  productionDate: string;
  expirationDate: string;
  receiveDate: string;
  acceptancePhoto?: string;
  invoicePhoto?: string;
  status: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Child {
  id: string;
  name: string;
  className: string;
  age: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
}

export interface ClassMealRecord {
  id: string;
  date: string;
  className: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  childRecords: ChildMealRecord[];
  recordedBy: string;
  createdAt: string;
}

export interface ChildMealRecord {
  childId: string;
  childName: string;
  allergies?: string[];
  dietaryRestrictions?: string[];
  attendance: boolean;
  leftovers: 'none' | 'little' | 'half' | 'most';
  notes?: string;
}

export interface AlertItem {
  id: number;
  type: 'allergy' | 'sample_expired' | 'batch_expired' | 'negative_review';
  message: string;
  status: 'active' | 'resolved';
  relatedId?: number;
  alertDate?: string;
  hasRectification: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RectificationItem {
  id: number;
  alertType: 'allergy' | 'sample_expired' | 'batch_expired' | 'negative_review';
  relatedId?: number;
  problemType: string;
  description: string;
  measures?: string;
  status: 'pending' | 'processing' | 'completed';
  deadline?: string;
  completedDate?: string;
  handler?: string;
  resultPhoto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Recipe {
  id: number;
  date: string;
  mealType: string;
  dishName: string;
  description?: string;
  ingredientBatches?: IngredientBatch[];
  photo?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  breakfast?: Recipe[];
  lunch?: Recipe[];
  dinner?: Recipe[];
  name?: string;
}

export interface Sample {
  id: number;
  sampleBoxNumber: string;
  date: string;
  mealType: string;
  dishName: string;
  sampleTime: string;
  sampler: string;
  photo?: string;
  status: string;
  disposeTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassroomMeal {
  id: number;
  date: string;
  className: string;
  mealType: string;
  allergies?: string;
  tempRestrictions?: string;
  leftovers?: string;
  leftoverCount: number;
  recorder?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EscortReview {
  id: number;
  date: string;
  parentName: string;
  className?: string;
  rating: number;
  photo?: string;
  suggestion?: string;
  isNegative: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Alert {
  id: number;
  type: string;
  title?: string;
  message: string;
  status: string;
  relatedId?: number;
  alertDate?: string;
  hasRectification: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rectification {
  id: number;
  alertType: string;
  relatedId?: number;
  problemType: string;
  description: string;
  measures?: string;
  status: string;
  deadline?: string;
  completedDate?: string;
  handler?: string;
  resultPhoto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  businessLicense?: string;
  isActive?: boolean;
}

export interface CreateIngredientBatchDto {
  batchNumber: string;
  ingredientName: string;
  quantity: number;
  unit?: string;
  supplierId: number;
  productionDate: string;
  expirationDate: string;
  receiveDate: string;
  acceptancePhoto?: string;
  invoicePhoto?: string;
  status?: string;
  remark?: string;
}

export interface CreateRecipeDto {
  date: string;
  mealType: string;
  dishName: string;
  description?: string;
  ingredientBatchIds?: number[];
  photo?: string;
  status?: string;
}

export interface CreateSampleDto {
  sampleBoxNumber: string;
  date: string;
  mealType: string;
  dishName: string;
  sampleTime: string;
  sampler: string;
  photo?: string;
  status?: string;
  disposeTime?: string;
}

export interface CreateClassroomMealDto {
  date: string;
  className: string;
  mealType: string;
  allergies?: string;
  tempRestrictions?: string;
  leftovers?: string;
  leftoverCount?: number;
  recorder?: string;
  remark?: string;
}

export interface CreateEscortReviewDto {
  date: string;
  parentName: string;
  className?: string;
  rating: number;
  photo?: string;
  suggestion?: string;
  isNegative?: boolean;
}

export interface CreateRectificationDto {
  alertType: string;
  relatedId?: number;
  problemType: string;
  description: string;
  measures?: string;
  status?: string;
  deadline?: string;
  completedDate?: string;
  handler?: string;
  resultPhoto?: string;
}

export interface CreateAlertDto {
  type: string;
  message: string;
  status?: string;
  relatedId?: number;
  alertDate?: string;
  hasRectification?: boolean;
}

export interface AllergyRiskResult {
  date: string;
  totalCount: number;
  allergyCount: number;
  allergyList: ClassroomMeal[];
}

export interface EscortReviewStatistics {
  date?: string;
  totalCount: number;
  averageRating: number;
  negativeCount: number;
  negativeList: EscortReview[];
}

export interface RecipeByDate {
  breakfast: Recipe[];
  lunch: Recipe[];
  dinner: Recipe[];
}

export interface PaginatedResult<T> {
  list: T[];
  items?: T[];
  data?: T[];
  total: number;
  page: number;
  pageSize: number;
}
