import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { HOME_ROUTE } from "../config";

// Componente que protege las rutas publicas.
// Impide que un usuario autenticado acceda, por ejemplo, a la pantalla de inicio de sesion para iniciar sesion (si es que ya inico sesion)

export default function PublicRoute({ children }) {

  // Obtiene el estado de autenticación y la informacion sobre si la sesión aún se está verificando.
  const { isAuthenticated, loading } = useAuth();

  // Mientras se restaura la sesión desde el contexto, muestra un indicador de carga.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Si el usuario ya inicio sesion, lo redirige al listado de usuarios para evitar que vuelva a la pantalla de login
  if (isAuthenticated) {
    return <Navigate to={HOME_ROUTE} replace />;
  }

  // Si el usuario no está autenticado, permite acceder a la ruta publica.
  return children;
}