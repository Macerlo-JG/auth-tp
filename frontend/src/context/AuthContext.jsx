import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { hasPermission, hasRole } from "../utils/permissions";

// Contexto que almacena la informacion de autenticacion y autorizacion de toda la aplicacion
export const AuthContext = createContext(null);

// Proveedor del contexto de autenticacion
// Envuelve la aplicación para compartir el estado de la sesion con todos los componentes hijos
export function AuthProvider({ children }) {
  // Almacena la información del usuario autenticado
  const [user, setUser] = useState(null);

  // Almacena los roles asignados al usuario
  const [roles, setRoles] = useState([]);

  // Almacena los permisos del usuario
  const [permissions, setPermissions] = useState([]);

  // Indica si existe una sesion autenticada
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Indica si todavia se esta restaurando la sesion desde el almacenamiento local
  const [loading, setLoading] = useState(true);

  // Restaura la sesion almacenada al iniciar la aplicacion
  // Si existe una sesion valida, carga el usuario, los roles y los permisos en el contexto
  useEffect(() => {
    const session = authService.getSession();

    if (session) {
      setUser(session.user);
      setRoles(session.roles);
      setPermissions(session.permisos);
      setIsAuthenticated(true);
    }

    // Finaliza el proceso de restauración de la sesion
    setLoading(false);
  }, []);

  // Inicio sesion + correspondientes validaciones utilizando el servicio de autenticacion
  // Si las credenciales son validas, actualiza el estado global con la informacion del usuario
  const login = async (email, password) => {
    try {
      debugger
      const session = await authService.login(email, password);

      setUser(session.user);
      setRoles(session.roles);
      setPermissions(session.permisos);
      setIsAuthenticated(true);

      return session;
    } catch (error) {
      throw error;
    }
  };

  // Cierra sesion
  // Limpia toda la informacion almacenada en el contexto
  const logout = async () => {
    await authService.logout();

    setUser(null);
    setRoles([]);
    setPermissions([]);
    setIsAuthenticated(false);
  };

  // Objeto que expone el estado y las funciones disponibles para todos los componentes que consuman el contexto
  const value = {
    user,
    roles,
    permissions,
    loading,
    isAuthenticated,
    login,
    logout,

    // Verifica si el usuario posee un permiso especifico
    hasPermission: (permission) =>
      hasPermission(permissions, permission),

    // Verifica si el usuario posee un rol especifico
    hasRole: (role) =>
      hasRole(roles, role),
  };


  // Proporciona el contexto de autenticacion a todos los componentes hijos
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}