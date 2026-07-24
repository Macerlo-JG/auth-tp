import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useAuth from "../../auth/hooks/useAuth.js";
import authService from "../../auth/services/authService.js";
import PopupAceptarDocumento from "./PopupAceptarDocumento.jsx";
import {
  obtenerDocumentosPendientes,
  aceptarDocumento,
} from "../../services/documentosLegalesService.js";
import { authFetch } from "../../api/cliente.js";
import { useLocation } from "react-router-dom";

const RUTAS_PUBLICAS = ["/login", "/activar-cuenta", "/recuperar-contrasena"];

// Componente "gate": se monta una única vez en App.jsx (fuera de las
// rutas), y se encarga de verificar si el usuario logueado tiene
// documentos legales pendientes de aceptación. Si los tiene, los
// muestra de a uno (en cola) con PopupAceptarDocumento, tapando el
// resto de la aplicación hasta que los acepte todos.
export default function VerificarDocumentosLegales() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [pendientes, setPendientes] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [verificado, setVerificado] = useState(false);
  const [documentoConBlob, setDocumentoConBlob] = useState(null);

  // Bloquea completamente la UI mientras se espera el logout
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setPendientes([]);
      setIndiceActual(0);
      setVerificado(false);
      setDocumentoConBlob(null);
      return;
    }

    const verificar = async () => {
      try {
        const documentos = await obtenerDocumentosPendientes();
        setPendientes(documentos);
      } catch (err) {
        console.error(err);
      } finally {
        setVerificado(true);
      }
    };

    verificar();
  }, [isAuthenticated]);

  const documentoActual = pendientes[indiceActual];

  // Descarga el PDF autenticado (con authFetch) y lo convierte en una URL
  // local (blob) antes de mostrarlo, ya que un iframe no envía el token.
  useEffect(() => {
    if (!documentoActual) {
      setDocumentoConBlob(null);
      return;
    }

    let urlLocal = null;
    let cancelado = false;

    const cargarPdf = async () => {
      try {
        const res = await authFetch(documentoActual.contenido);

        if (!res.ok) {
          throw new Error("No se pudo cargar el documento");
        }

        const blob = await res.blob();
        urlLocal = URL.createObjectURL(blob);

        if (!cancelado) {
          setDocumentoConBlob({
            ...documentoActual,
            contenido: urlLocal,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("No se pudo cargar el documento para mostrarlo");
      }
    };

    cargarPdf();

    return () => {
      cancelado = true;
      if (urlLocal) {
        URL.revokeObjectURL(urlLocal);
      }
    };
  }, [documentoActual]);

  const enRutaPublica = RUTAS_PUBLICAS.includes(location.pathname);

  if (
    !isAuthenticated ||
    enRutaPublica ||
    !verificado ||
    indiceActual >= pendientes.length ||
    !documentoConBlob
  ) {
    return null;
  }

  const handleAceptar = async () => {
    try {
      await aceptarDocumento(documentoActual.id_documento);

      toast.success(`"${documentoActual.titulo}" aceptado`);

      setIndiceActual((i) => i + 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo registrar la aceptación");
    }
  };

  // El documento es obligatorio para poder seguir usando el sistema.
  // Si cancela, se bloquea la aplicación, se deja visible el toast
  // durante 3 segundos y luego se cierra la sesión.
  const handleCancelar = async () => {
    setLoading(true);

    toast.error(
      "Es necesario aceptar el documento para continuar. Se cerrará tu sesión."
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await authService.logout();

    window.location.assign("/login");
  };

  return (
    <>
      <PopupAceptarDocumento
        documento={documentoConBlob}
        onAceptar={handleAceptar}
        onCancelar={handleCancelar}
      />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 cursor-wait">
          <div className="rounded-lg bg-white px-6 py-4 shadow-xl">
            <span className="text-sm font-medium">Cerrando sesión...</span>
          </div>
        </div>
      )}
    </>
  );
}
