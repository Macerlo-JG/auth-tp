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

export default function DocumentosLegalesPage() {
  // Listado de tipos de documento (cada uno con su vigente + historial).
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // { tipo } para "nueva versión" de uno existente, {} para "nuevo tipo",
  // null = modal cerrado.
  const [modalSubir, setModalSubir] = useState(null);
  const [modalHistorial, setModalHistorial] = useState(null);
  const [pdfAVer, setPdfAVer] = useState(null);

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
            onVerPdf={setPdfAVer}
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
          onVerPdf={setPdfAVer}
        />
      )}

      {pdfAVer && <ModalVerPdf documento={pdfAVer} onClose={() => setPdfAVer(null)} />}
    </Layout>
  );
}
