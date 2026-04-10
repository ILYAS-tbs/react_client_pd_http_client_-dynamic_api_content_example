import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, User } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Fallback: if React state hasn't flushed yet, try localStorage.
  // This covers the edge case after register() where navigate fires
  // before the batched setUser update is committed.
  let effectiveUser: User | null = user;
  if (!effectiveUser) {
    try {
      const stored = localStorage.getItem("schoolParentOrTeacherManagementUser");
      if (stored) effectiveUser = JSON.parse(stored) as User;
    } catch { /* ignore parse errors */ }
  }

  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  // If admin access is required, check if user is admin
  if (requireAdmin) {
    if (!effectiveUser.is_admin) {
      return <Navigate to={`/${effectiveUser.role}-dashboard`} replace />;
    }
  } else if (allowedRoles && !allowedRoles.includes(effectiveUser.role)) {
    // If role-based access, check role
    const path = `/${effectiveUser.role}-dashboard`;
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
