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
import "./index.css";

function App() {
  return (
    <>
      <Toaster
      // Contenedor donde apareceran las notificaciones toast
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: { zIndex: 9999 },
        }}
      />
      <Routes>

        <Route path="/"element={<Navigate to="/usuarios" replace />}/>

        <Route path="/login"element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }/>
        <Route path="/usuarios"element={
            <ProtectedRoute>
              <ListadoUsuarios />
            </ProtectedRoute>
          }/>
        <Route path="/usuarios/nuevo"element={
            <ProtectedRoute roles={["Administrador"]} permissions={["usuarios.crear"]}>
              <NuevoUsuario />
            </ProtectedRoute>
          }/>
        <Route path="/usuarios/:id"element={
            <ProtectedRoute>
              <VerUsuario />
            </ProtectedRoute>
          }/>
        <Route path="/usuarios/:id/editar" element={
            <ProtectedRoute roles={["Administrador"]} >
              <EditarUsuarioPage />
            </ProtectedRoute>
          }/>
        <Route path="/cambiar-contrasena" element={
            <ProtectedRoute>
              <CambiarContrasena />
            </ProtectedRoute>
          }/>

      </Routes>
    </>
  );
}
//por el momento "/" redirecciona a "/usuarios" hasta que haya un "/home"

export default App;
