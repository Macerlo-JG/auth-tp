import { AUTH_API } from "../auth/config";
import authService from "../auth/services/authService";

export async function authFetch(path, options = {}) {
  const sesion = authService.getSession();
  const token = sesion?.access_token;

  const res = await fetch(`${AUTH_API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res;
}
