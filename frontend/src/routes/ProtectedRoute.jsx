import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({
  children,
  roles = [],
  permissions = [],
}) {
  const {
    isAuthenticated,
    loading,
    hasRole,
    hasPermission,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    permissions.length > 0 &&
    !permissions.some((permiso) => hasPermission(permiso))
  ) {
    return <Navigate to="/usuarios" replace />;
  }

  if (
    roles.length > 0 &&
    !roles.some((rol) => hasRole(rol))
  ) {
    return <Navigate to="/usuarios" replace />;
  }

  return children;
}