import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { hasPermission, hasRole } from "../utils/permissions";

// Contexto que almacena la informacion de autenticacion y autorizacion de toda la aplicacion
export const AuthContext = createContext(null);

// Proveedor del contexto de autenticacion
// Envuelve la aplicación para compartir el estado de la sesion con todos los componentes hijos
export function AuthProvider({ children }) {

  // Almacena los roles asignados al usuario
  const [roles, setRoles] = useState([]);


  // Almacena los permisos del usuario
  const [acciones, setAcciones] = useState([]);

  // Almacena los datos básicos del usuario logueado (por ahora, solo id).
  const [user, setUser] = useState(null);

  // Indica si existe una sesion autenticada
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Indica si todavia se esta restaurando la sesion desde el almacenamiento local
  const [loading, setLoading] = useState(true);

  // Restaura la sesion almacenada al iniciar la aplicacion
  // Si existe una sesion valida, carga el usuario, los roles y los permisos en el contexto
  useEffect(() => {
    const session = authService.getSession();

    if (session) {
      setRoles(session.roles ?? []);
      setAcciones(session.acciones ?? []);
      setUser(session.user ?? null);
      setIsAuthenticated(true);
    }

    // Finaliza el proceso de restauración de la sesion
    setLoading(false);
  }, []);

 // Inicio sesión
const login = async (email, password) => {
  console.debug("[login] Inicio", { email });

  try {
    console.debug("[login] Llamando a authService.login...");
    const session = await authService.login(email, password);

    console.debug("[login] Session recibida:", session);

    console.debug("[login] roles:", session?.roles);
    setRoles(session.roles ?? []);

    console.debug("[login] acciones:", session?.acciones);
    setAcciones(session.acciones ?? []);

    console.debug("[login] user:", session?.user);
    setUser(session.user ?? null);

    console.debug("[login] setIsAuthenticated(true)");
    setIsAuthenticated(true);

    console.debug("[login] Fin OK");

    return session;
  } catch (error) {
    console.error("[login] ERROR", error);
    console.error("[login] message:", error?.message);
    console.error("[login] response:", error?.response);
    console.error("[login] response.data:", error?.response?.data);
    console.error("[login] stack:", error?.stack);

    throw error;
  }
};

  // Cierra sesion
  // Limpia toda la informacion almacenada en el contexto
  const logout = async () => {
    await authService.logout();
 
    setRoles([]);
    setAcciones([]);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Objeto que expone el estado y las funciones disponibles para todos los componentes que consuman el contexto
  const value = {
    user,
    roles,
    acciones,
    loading,
    isAuthenticated,
    user,
    login,
    logout,

    // hasPermission trabaja sobre acciones ("servicio.nombre").
    hasPermission: (accion) => hasPermission(acciones, accion),
    hasRole: (role) => hasRole(roles, role),
  };


  // Proporciona el contexto de autenticacion a todos los componentes hijos
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}