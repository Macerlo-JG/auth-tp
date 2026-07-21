import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import ListadoUsuarios from "./pages/ListadoUsuarios.jsx";
import NuevoUsuario from "./pages/NuevoUsuario.jsx";
import EditarUsuarioPage from "./pages/EditarUsuarioPage.jsx";
import VerUsuario from "./pages/VerUsuario.jsx";
import CambiarContrasena from "./pages/CambiarContrasena.jsx";
import ActivarCuenta from "./pages/ActivarCuenta.jsx";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";
import "./index.css";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: { zIndex: 9999, yIndex: 8000 },
        }}
      />
      <Routes>

        <Route path="/" element={<Navigate to="/usuarios" replace />} />

        <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

        <Route path="/activar-cuenta" element={
            <PublicRoute>
              <ActivarCuenta />
            </PublicRoute>
          } />

        <Route path="/recuperar-contrasena" element={
            <PublicRoute>
              <RecuperarContrasena />
            </PublicRoute>
          } />

        <Route path="/usuarios" element={
            <ProtectedRoute>
              <ListadoUsuarios />
            </ProtectedRoute>
          } />

        <Route path="/usuarios/nuevo" element={
            <ProtectedRoute permissions={["auth.usuarios.control_parcial"]}>
              <NuevoUsuario />
            </ProtectedRoute>
          } />

        <Route path="/usuarios/:id" element={
            <ProtectedRoute>
              <VerUsuario />
            </ProtectedRoute>
          } />

        <Route path="/usuarios/:id/editar" element={
            <ProtectedRoute roles={["ADMINISTRADOR"]}>
              <EditarUsuarioPage />
            </ProtectedRoute>
          } />

        <Route path="/cambiar-contrasena" element={
            <ProtectedRoute>
              <CambiarContrasena />
            </ProtectedRoute>
          } />

      </Routes>
    </>
  );
}

export default App;
