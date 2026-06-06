import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useUser } from './context/UserContext';
import AppLayout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RecipesPage from './pages/RecipesPage';
import SamplesPage from './pages/SamplesPage';
import SuppliersPage from './pages/SuppliersPage';
import ClassroomMealsPage from './pages/ClassroomMealsPage';
import EscortReviewsPage from './pages/EscortReviewsPage';
import RectificationsPage from './pages/RectificationsPage';
import AlertsPage from './pages/AlertsPage';
import AllergyChildrenPage from './pages/AllergyChildrenPage';
import MealDistributionsPage from './pages/MealDistributionsPage';
import type { UserRole } from './types';

const ROLE_ROUTES: Record<string, string[]> = {
  logistics: [
    '/dashboard',
    '/recipes',
    '/samples',
    '/suppliers',
    '/classroom-meals',
    '/allergy-children',
    '/meal-distributions',
    '/escort-reviews',
    '/rectifications',
    '/alerts',
  ],
  teacher: [
    '/dashboard',
    '/recipes',
    '/samples',
    '/classroom-meals',
    '/allergy-children',
    '/meal-distributions',
    '/escort-reviews',
  ],
  parent: [
    '/dashboard',
    '/recipes',
    '/samples',
    '/escort-reviews',
  ],
  regulator: [
    '/dashboard',
    '/recipes',
    '/samples',
    '/suppliers',
    '/classroom-meals',
    '/allergy-children',
    '/meal-distributions',
    '/escort-reviews',
    '/rectifications',
    '/alerts',
  ],
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const allowedPaths = user ? ROLE_ROUTES[user.role] || [] : [];
  if (!allowedPaths.some((p) => location.pathname.startsWith(p))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'teacher', 'parent', 'regulator']}>
              <AppLayout>
                <RecipesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/samples"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'teacher', 'parent', 'regulator']}>
              <AppLayout>
                <SamplesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'regulator']}>
              <AppLayout>
                <SuppliersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom-meals"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'logistics', 'regulator']}>
              <AppLayout>
                <ClassroomMealsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/allergy-children"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'logistics', 'regulator']}>
              <AppLayout>
                <AllergyChildrenPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-distributions"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'logistics', 'regulator']}>
              <AppLayout>
                <MealDistributionsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/escort-reviews"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'teacher', 'parent', 'regulator']}>
              <AppLayout>
                <EscortReviewsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rectifications"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'regulator']}>
              <AppLayout>
                <RectificationsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRoles={['logistics', 'regulator']}>
              <AppLayout>
                <AlertsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
