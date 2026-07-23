import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useAuth from "../../auth/hooks/useAuth.js";
import authService from "../../auth/services/authService.js";
import PopupAceptarDocumento from "./PopupAceptarDocumento.jsx";
import {
  obtenerDocumentosPendientes,
  aceptarDocumento,
} from "../../services/documentosLegalesService.js";

// Componente "gate": se monta una única vez en App.jsx (fuera de las
// rutas), y se encarga de verificar si el usuario logueado tiene
// documentos legales pendientes de aceptación. Si los tiene, los
// muestra de a uno (en cola) con PopupAceptarDocumento, tapando el
// resto de la aplicación hasta que los acepte todos.
export default function VerificarDocumentosLegales() {
  const { isAuthenticated } = useAuth();

  const [pendientes, setPendientes] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Al desloguearse, se reinicia todo para la próxima sesión.
      setPendientes([]);
      setIndiceActual(0);
      setVerificado(false);
      return;
    }

    const verificar = async () => {
      try {
        const documentos = await obtenerDocumentosPendientes();
        setPendientes(documentos);
      } catch (err) {
        console.error(err);
        // Si falla la verificación en sí (ej: error de red), no
        // bloqueamos el acceso al sistema por eso.
      } finally {
        setVerificado(true);
      }
    };

    verificar();
  }, [isAuthenticated]);

  if (!isAuthenticated || !verificado || indiceActual >= pendientes.length) {
    return null;
  }

  const documentoActual = pendientes[indiceActual];

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

  // El documento es obligatorio para poder seguir usando el sistema:
  // si el usuario cancela, no puede quedarse logueado sin aceptarlo.
  const handleCancelar = async () => {
    toast.error("Es necesario aceptar el documento para continuar. Se cerrará tu sesión.");
    await authService.logout();
    window.location.assign("/login");
  };

  return (
    <PopupAceptarDocumento
      documento={documentoActual}
      onAceptar={handleAceptar}
      onCancelar={handleCancelar}
    />
  );
}
