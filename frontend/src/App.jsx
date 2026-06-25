import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ListadoUsuarios from "./paginas/ListadoUsuarios.jsx";
import NuevoUsuario from "./paginas/NuevoUsuario.jsx";
import EditarUsuarioPage from "./paginas/EditarUsuarioPage.jsx";
import VerUsuario from "./paginas/VerUsuario.jsx";

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
