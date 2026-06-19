import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';

// Layout
import MainLayout from './components/layout/MainLayout';
import RoleGuard from './components/auth/RoleGuard';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import Biometric from './pages/Biometric';
import Academic from './pages/Academic';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Teacher from './pages/Teacher';

// Student pages
import StudentAcademic from './pages/Student/Academic';
import RoutinePrediction from './pages/Student/RoutinePrediction';
import Reinforcement from './pages/Student/Reinforcement';

// Admin CRUD pages
import AdminStudents from './pages/Admin/Students';
import AdminTeachers from './pages/Admin/Teachers';
import AdminClassrooms from './pages/Admin/Classrooms';

// UI Atoms
import LoadingSpinner from './components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Redirección de entrada según rol verificado
function RoleLanding() {
  const role = useAuthStore((state) => state.user?.role);
  if (role === 'STUDENT') {
    return <Navigate to="/student/academic" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function AppContent() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <RoleLanding />}
      />

      {/* Private Authenticated Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<RoleLanding />} />

        {/* Módulos de docente (ADMIN tiene acceso transversal vía RoleGuard) */}
        <Route
          path="dashboard"
          element={
            <RoleGuard allow={['TEACHER']}>
              <Dashboard />
            </RoleGuard>
          }
        />
        <Route
          path="attendance"
          element={
            <RoleGuard allow={['TEACHER']}>
              <Biometric />
            </RoleGuard>
          }
        />
        <Route
          path="academic"
          element={
            <RoleGuard allow={['TEACHER']}>
              <Academic />
            </RoleGuard>
          }
        />
        <Route
          path="analytics"
          element={
            <RoleGuard allow={['TEACHER']}>
              <Analytics />
            </RoleGuard>
          }
        />

        {/* Módulos de estudiante (ADMIN también puede verlos) */}
        <Route
          path="student/academic"
          element={
            <RoleGuard allow={['STUDENT']}>
              <StudentAcademic />
            </RoleGuard>
          }
        />
        <Route
          path="student/routine"
          element={
            <RoleGuard allow={['STUDENT']}>
              <RoutinePrediction />
            </RoleGuard>
          }
        />
        <Route
          path="student/reinforcement"
          element={
            <RoleGuard allow={['STUDENT']}>
              <Reinforcement />
            </RoleGuard>
          }
        />

        {/* CRUDs administrativos (solo ADMIN vía RoleGuard) */}
        <Route
          path="admin/students"
          element={
            <RoleGuard allow={['ADMIN']}>
              <AdminStudents />
            </RoleGuard>
          }
        />
        <Route
          path="admin/teachers"
          element={
            <RoleGuard allow={['ADMIN']}>
              <AdminTeachers />
            </RoleGuard>
          }
        />
        <Route
          path="admin/classrooms"
          element={
            <RoleGuard allow={['ADMIN']}>
              <AdminClassrooms />
            </RoleGuard>
          }
        />

        {/* Común a todos los roles autenticados */}
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
