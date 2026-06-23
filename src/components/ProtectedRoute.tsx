import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false, requireAuth = false }: Props) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (adminOnly && !isAdmin) {
    return <Navigate to="/strefy" replace />;
  }

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
