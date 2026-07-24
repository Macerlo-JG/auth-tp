import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/layout/Layout.jsx";
import TablaDocumentosLegales from "../components/documentosLegales/TablaDocumentosLegales.jsx";
import ModalSubirDocumento from "../components/documentosLegales/ModalSubirDocumento.jsx";
import ModalHistorialDocumento from "../components/documentosLegales/ModalHistorialDocumento.jsx";
import ModalVerPdf from "../components/documentosLegales/ModalVerPdf.jsx";

import {
  obtenerTodosLosDocumentos,
  agruparDocumentosPorTipo,
} from "../services/documentosLegalesService.js";
import { authFetch } from "../api/cliente.js";

export default function DocumentosLegalesPage() {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalSubir, setModalSubir] = useState(null);
  const [modalHistorial, setModalHistorial] = useState(null);
  const [pdfAVer, setPdfAVer] = useState(null);
  const [cargandoPdf, setCargandoPdf] = useState(false);

  const cargarDocumentos = async () => {
    try {
      const documentos = await obtenerTodosLosDocumentos();
      setGrupos(agruparDocumentosPorTipo(documentos));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al cargar documentos legales");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const handleNuevoTipo = () => setModalSubir({});
  const handleNuevaVersion = (tipo) => setModalSubir({ tipo });

  const handlePublicado = async () => {
    setModalSubir(null);
    await cargarDocumentos();
  };

  // Antes de mostrar el PDF, lo descargamos nosotros mismos con el token
  // de sesión (authFetch) y armamos una URL local (blob) que VisorPdf
  // puede usar como si fuera un archivo común, sin que el navegador
  // tenga que pedirlo por su cuenta sin credenciales.
  const handleVerPdf = async (documento) => {
    setCargandoPdf(true);
    try {
      const res = await authFetch(documento.contenido);

      if (!res.ok) {
        throw new Error("No se pudo cargar el PDF");
      }

      const blob = await res.blob();
      const urlLocal = URL.createObjectURL(blob);

      setPdfAVer({ ...documento, contenido: urlLocal });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo abrir el documento");
    } finally {
      setCargandoPdf(false);
    }
  };

  const handleCerrarPdf = () => {
    // Libera la memoria del blob al cerrar, para no acumular URLs sueltas.
    if (pdfAVer?.contenido?.startsWith("blob:")) {
      URL.revokeObjectURL(pdfAVer.contenido);
    }
    setPdfAVer(null);
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Documentos Legales</h1>

          <button type="button" onClick={handleNuevoTipo} className="btn-bomberos shrink-0 w-full sm:w-auto justify-center">
            <span className="text-lg leading-none">+</span>
            Nuevo tipo de documento
          </button>
        </div>

        {cargando ? (
          <p className="text-center text-gray-500 py-12">Cargando documentos...</p>
        ) : (
          <TablaDocumentosLegales
            grupos={grupos}
            onVerPdf={handleVerPdf}
            onNuevaVersion={handleNuevaVersion}
            onVerHistorial={setModalHistorial}
          />
        )}
      </div>

      {modalSubir && (
        <ModalSubirDocumento
          tipoInicial={modalSubir.tipo}
          onClose={() => setModalSubir(null)}
          onPublicado={handlePublicado}
        />
      )}

      {modalHistorial && (
        <ModalHistorialDocumento
          grupo={modalHistorial}
          onClose={() => setModalHistorial(null)}
          onVerPdf={handleVerPdf}
        />
      )}

      {cargandoPdf && (
        <div className="modal-overlay" style={{ zIndex: 1400 }}>
          <p className="text-white">Cargando documento...</p>
        </div>
      )}

      {pdfAVer && <ModalVerPdf documento={pdfAVer} onClose={handleCerrarPdf} />}
    </Layout>
  );
}