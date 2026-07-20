import { IconShield, IconFolder, IconUsers, IconChevronDown } from "../icons.jsx";
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth.js";

export default function Navbar() {

const navigate = useNavigate();
const { user, logout } = useAuth();
const [open, setOpen] = useState(false);
const menuRef = useRef(null);

useEffect(() => {
  function handleClickAfuera(event) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setOpen(false);
    }
  }
  document.addEventListener(
    "mousedown",
    handleClickAfuera
  );
  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickAfuera
    );
}, []);
async function handleLogout() {
  await logout();
  navigate("/login", { replace: true });
}
  return (
    <header className="bg-bomberos shadow-md">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-3 shrink-0">
            <IconShield />
            <div className="text-white leading-tight">
              <div className="font-bold text-[15px]">Sistema de Usuarios</div>
              <div className="text-[11px] text-white/75">Bomberos Voluntarios</div>
            </div>
          </div>

          <nav className="flex items-center">
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white border-b-2 border-white"
                    : "text-white/80 hover:text-white"
                }`
              }
            >
              <IconFolder />
              Usuarios
            </NavLink>
          </nav>
          <div
            ref={menuRef}
            className="relative"
          >
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-white text-sm font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <IconUsers />
              </div>
              <span className="hidden sm:inline">
                {user?.nombre}
              </span>
              <IconChevronDown />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-2 z-50">

                <div className="px-4 pb-2 border-b">
                  <p className="font-semibold">
                    {user?.nombre}
                  </p>
                </div>
                <NavLink
                  to="/cambiar-contrasena"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Cambiar contraseña
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Cerrar sesión
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
