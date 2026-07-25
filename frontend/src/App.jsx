import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./auth/routes/ProtectedRoute.jsx";
import PublicRoute from "./auth/routes/PublicRoute.jsx";
import ListadoUsuarios from "./pages/ListadoUsuarios.jsx";
import NuevoUsuario from "./pages/NuevoUsuario.jsx";
import EditarUsuarioPage from "./pages/EditarUsuarioPage.jsx";
import VerUsuario from "./pages/VerUsuario.jsx";
import CambiarContrasena from "./pages/CambiarContrasena.jsx";
import ActivarCuenta from "./pages/ActivarCuenta.jsx";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";
import RolesPage from "./pages/RolesPage.jsx";
import DocumentosLegalesPage from "./pages/DocumentosLegalesPage.jsx";
import VerificarDocumentosLegales from "./components/documentosLegales/VerificarDocumentosLegales.jsx";
import "./index.css";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        // Se bajan un poco las notificaciones para que no tapen el
        // botón de cerrar sesión de arriba a la derecha.
        containerStyle={{ top: "10%" }}
        toastOptions={{
          duration: 2500,
          style: { zIndex: 9999 },
        }}
      />
      <VerificarDocumentosLegales />
      <Routes>

        <Route path="/" element={<Navigate to="/usuarios" replace />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/activar-cuenta" element={<PublicRoute><ActivarCuenta /></PublicRoute>} />
        <Route path="/recuperar-contrasena" element={<PublicRoute><RecuperarContrasena /></PublicRoute>} />

        <Route path="/usuarios" element={<ProtectedRoute><ListadoUsuarios /></ProtectedRoute>} />

        {/* Antes "usuarios.control_parcial" cubría crear y editar juntos.
            Ahora son dos permisos separados, más precisos. */}
        <Route path="/usuarios/nuevo" element={
            <ProtectedRoute permissions={["auth.usuarios.crear"]}>
              <NuevoUsuario />
            </ProtectedRoute>
          } />

        <Route path="/usuarios/:id" element={
            <ProtectedRoute permissions={["auth.usuarios.ver"]}>
              <VerUsuario />
            </ProtectedRoute>
          } />

        <Route path="/usuarios/:id/editar" element={
            <ProtectedRoute permissions={["auth.usuarios.editar"]}>
              <EditarUsuarioPage />
            </ProtectedRoute>
          } />

        <Route path="/cambiar-contrasena" element={<ProtectedRoute><CambiarContrasena /></ProtectedRoute>} />

        <Route path="/roles" element={
            <ProtectedRoute permissions={["auth.roles.ver"]}>
              <RolesPage />
            </ProtectedRoute>
          } />

        {/* Antes decía "auth.roles.ver" por error: cualquiera que
            pudiera ver roles entraba acá. Ahora pide el permiso real
            de documentos legales. */}
        <Route path="/documentos-legales" element={
            <ProtectedRoute permissions={["auth.documentos_legales.control_parcial"]}>
              <DocumentosLegalesPage />
            </ProtectedRoute>
          } />

      </Routes>
    </>
  );
}

export default App;