import { NavLink } from "react-router-dom";
import { IconShield, IconFolder, IconUsers, IconChevronDown } from "../icons.jsx";

export default function Navbar() {
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

          <div className="flex items-center gap-2 text-white text-sm font-medium shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <IconUsers />
            </div>
            <span className="hidden sm:inline">Administrador</span>
            <IconChevronDown className="text-white/70" />
          </div>
        </div>
      </div>
    </header>
  );
}
