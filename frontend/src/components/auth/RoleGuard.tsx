import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../api/auth.api';

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
  redirectTo?: string;
}

// ADMIN tiene acceso transversal a todos los módulos (control y pruebas locales).
export default function RoleGuard({ allow, children, redirectTo = '/' }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = user.role === 'ADMIN' || allow.includes(user.role);

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
