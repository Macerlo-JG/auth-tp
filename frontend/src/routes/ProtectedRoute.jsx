import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Componente que protege una ruta
// Verifica si el usuario esta autenticado y si posee alguno de los roles permitidos para acceder (opcional este ultimo)
export default function ProtectedRoute({
  children,
  roles = [],
}) {

  // Obtiene el estado de autenticacion y las utilidades necesarias desde el contexto de autenticacion

  const {
    isAuthenticated,
    loading,
    hasRole,
  } = useAuth();

  // Mientras se verifica la sesion, muestra un indicador de carga para evitar renderizar la ruta antes de tiempo
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  // Si el usuario no esta autenticado, lo redirige a la pantalla de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere uno o mas roles y el usuario no posee ninguno de ellos, se redirige al listado de usuarios
  if (
    roles.length > 0 &&
    !roles.some((rol) => hasRole(rol))
  ) {
    return <Navigate to="/usuarios" replace />;
  }

  // Si todas las validaciones son correctas, renderiza el contenido de la ruta protegida
  return children;
}