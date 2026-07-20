// Verifica si el usuario tiene un permiso
export function hasPermission(userPermissions = [], permission) {
  return userPermissions.includes(permission);
}

// Verifica si el usuario tiene rol
export function hasRole(userRoles = [], role) {
  return userRoles.some((r) => r.nombre === role);
}
