import type { ReactNode } from 'react';

export type UserRole = 'logistics' | 'teacher' | 'parent' | 'regulator';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
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

export interface Recipe {
  id: string;
  date: string;
  breakfast: Dish[];
  lunch: Dish[];
  dinner: Dish[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
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
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  licenseNo: string;
  status: 'active' | 'inactive';
}

export interface IngredientBatch {
  id: string;
  batchNo: string;
  ingredientName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  productionDate: string;
  expiryDate: string;
  inspectionStatus: 'passed' | 'failed' | 'pending';
  receivedAt: string;
  operator: string;
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

export interface Alert {
  id: string;
  type: 'sample_expiry' | 'ingredient_expiry' | 'allergy_risk' | 'rectification_overdue';
  title: string;
  message: string;
  status: 'active' | 'resolved';
  relatedId?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EscortReview {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  rating: number;
  tasteRating?: number;
  hygieneRating?: number;
  nutritionRating?: number;
  photoUrl?: string;
  suggestion?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  createdAt: string;
}

export interface ClassroomMeal {
  id: string;
  date: string;
  className: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  attendanceCount: number;
  allergyRisks?: string[];
  recordedBy: string;
  notes?: string;
  createdAt: string;
}
