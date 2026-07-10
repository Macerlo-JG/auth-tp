import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";
import { hasPermission, hasRole } from "../utils/permissions";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Evita renderizar mientras se restaura la sesion
  const [loading, setLoading] = useState(true);

  
  // Restaura la sesión guardada al iniciar la aplicacion
  
  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setUser(session.user);
      setRoles(session.roles);
      setPermissions(session.permisos);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Inicia sesion
  const login = async (email, password) => {
    const session = await authService.login(email, password);
    setUser(session.user);
    setRoles(session.roles);
    setPermissions(session.permisos);
    setIsAuthenticated(true);
    return session;
  };

  // Cierra sesion
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setIsAuthenticated(false);
  };

const value = {
  user,
  roles,
  permissions,
  loading,
  isAuthenticated,
  login,
  logout,
  hasPermission: (permission) =>
    hasPermission(permissions, permission),
  hasRole: (role) =>
    hasRole(roles, role),
};
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
