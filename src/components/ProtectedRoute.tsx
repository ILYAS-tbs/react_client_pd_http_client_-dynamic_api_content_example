import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin access is required, check if user is admin
  if (requireAdmin) {
    if (!user.is_admin) {
      const path = `/${user.role}-dashboard`;
      return <Navigate to={path} replace />;
    }
  } else if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role-based access, check role
    const path = `/${user.role}-dashboard`;
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
