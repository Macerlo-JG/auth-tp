import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ListadoUsuarios from "./pages/ListadoUsuarios.jsx";
import NuevoUsuario from "./pages/NuevoUsuario.jsx";
import EditarUsuarioPage from "./pages/EditarUsuarioPage.jsx";
import VerUsuario from "./pages/VerUsuario.jsx";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: { zIndex: 9999 },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/usuarios" replace />} />
        <Route path="/usuarios" element={<ListadoUsuarios />} />
        <Route path="/usuarios/nuevo" element={<NuevoUsuario />} />
        <Route path="/usuarios/:id" element={<VerUsuario />} />
        <Route path="/usuarios/:id/editar" element={<EditarUsuarioPage />} />
      </Routes>
    </>
  );
}

export default App;
