import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { IconUpload, IconFileText } from "../icons.jsx";
import { publicarDocumento } from "../../services/documentosLegalesService.js";
import {
  obtenerCatalogoTipos,
  agregarTipoPersonalizado,
} from "../../utils/tiposDocumentoLegal.js";
import { obtenerRoles } from "../../services/rolesService.js";
import { esArchivoPdf, formatearTamanoArchivo } from "../../utils/archivoUtils.js";

// Formulario de publicación de un documento legal.
// - tipoInicial=undefined  -> modo "nuevo tipo de documento" (pide clave
//   interna, nombre visible y a qué roles aplica).
// - tipoInicial="tyc"/etc. -> modo "nueva versión" de un tipo existente.
export default function ModalSubirDocumento({ tipoInicial, onClose, onPublicado }) {
  const esNuevoTipo = !tipoInicial;
  const catalogo = obtenerCatalogoTipos();

  const [tipo, setTipo] = useState(tipoInicial ?? "");
  const [etiquetaNueva, setEtiquetaNueva] = useState("");
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(esNuevoTipo);

  const [version, setVersion] = useState("");
  const [titulo, setTitulo] = useState(tipoInicial ? catalogo[tipoInicial]?.label ?? "" : "");
  const [fechaPublicacion, setFechaPublicacion] = useState("");
  const [archivo, setArchivo] = useState(null);

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Sólo hace falta el listado de roles cuando se está creando un tipo
  // nuevo (para elegir a quién le aplica).
  useEffect(() => {
    if (!esNuevoTipo) return;

    const cargarRoles = async () => {
      try {
        const roles = await obtenerRoles();
        setRolesDisponibles(roles);
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar los roles");
      } finally {
        setCargandoRoles(false);
      }
    };

    cargarRoles();
  }, [esNuevoTipo]);

  const toggleRol = (nombreRol) => {
    setRolesSeleccionados((actual) =>
      actual.includes(nombreRol)
        ? actual.filter((r) => r !== nombreRol)
        : [...actual, nombreRol]
    );
  };

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];

    if (file && !esArchivoPdf(file)) {
      toast.error("El archivo debe ser un PDF");
      e.target.value = "";
      setArchivo(null);
      return;
    }

    setArchivo(file ?? null);
  };

  const validar = () => {
    const nuevosErrores = {};

    if (esNuevoTipo) {
      const tipoLimpio = tipo.trim();

      if (!tipoLimpio) {
        nuevosErrores.tipo = "La clave interna es obligatoria (ej: politica_privacidad)";
      } else if (!/^[a-z_]+$/.test(tipoLimpio)) {
        nuevosErrores.tipo = "Usá solo minúsculas y guiones bajos (ej: politica_privacidad)";
      } else if (catalogo[tipoLimpio]) {
        nuevosErrores.tipo = "Ya existe un tipo de documento con esa clave";
      }

      if (!etiquetaNueva.trim()) {
        nuevosErrores.etiqueta = "El nombre visible es obligatorio";
      }
    }

    if (!version.trim()) nuevosErrores.version = "La versión es obligatoria";
    if (!titulo.trim()) nuevosErrores.titulo = "El título es obligatorio";
    if (!archivo) nuevosErrores.archivo = "Debés adjuntar el PDF del documento";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);

    try {
      const tipoFinal = esNuevoTipo ? tipo.trim() : tipoInicial;

      if (esNuevoTipo) {
        agregarTipoPersonalizado(tipoFinal, {
          label: etiquetaNueva.trim(),
          rolesRequeridos: rolesSeleccionados,
        });
      }

      await publicarDocumento({
        tipo: tipoFinal,
        version: version.trim(),
        titulo: titulo.trim(),
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion).toISOString() : undefined,
        archivo,
      });

      toast.success("Documento publicado correctamente");
      onPublicado();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo publicar el documento");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-5">
          {esNuevoTipo
            ? "Nuevo tipo de documento"
            : `Nueva versión — ${catalogo[tipoInicial]?.label ?? tipoInicial}`}
        </h2>

        <form onSubmit={handleSubmit}>
          {esNuevoTipo && (
            <>
              <div className="form-section">
                <label className="form-label">
                  Clave interna <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value.toLowerCase())}
                  placeholder="ej: politica_privacidad"
                  className="form-input w-full"
                />
                {errores.tipo && <p className="text-xs text-red-600 mt-1">{errores.tipo}</p>}
              </div>

              <div className="form-section">
                <label className="form-label">
                  Nombre visible <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={etiquetaNueva}
                  onChange={(e) => setEtiquetaNueva(e.target.value)}
                  placeholder="ej: Política de Privacidad"
                  className="form-input w-full"
                />
                {errores.etiqueta && (
                  <p className="text-xs text-red-600 mt-1">{errores.etiqueta}</p>
                )}
              </div>

              <div className="form-section">
                <label className="form-label">¿A qué usuarios aplica?</label>
                {cargandoRoles ? (
                  <p className="text-sm text-gray-500">Cargando roles...</p>
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={rolesSeleccionados.length === 0}
                        onChange={() => setRolesSeleccionados([])}
                      />
                      Todos los usuarios
                    </label>
                    {rolesDisponibles.map((rol) => (
                      <label
                        key={rol.id_rol}
                        className="flex items-center gap-2 text-sm text-gray-600 pl-4"
                      >
                        <input
                          type="checkbox"
                          checked={rolesSeleccionados.includes(rol.nombre)}
                          onChange={() => toggleRol(rol.nombre)}
                        />
                        Solo {rol.nombre}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-section grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Versión <span className="required">*</span>
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="ej: 2.0"
                className="form-input w-full"
              />
              {errores.version && <p className="text-xs text-red-600 mt-1">{errores.version}</p>}
            </div>
            <div>
              <label className="form-label">Vigente desde</label>
              <input
                type="date"
                value={fechaPublicacion}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Título <span className="required">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="form-input w-full"
            />
            {errores.titulo && <p className="text-xs text-red-600 mt-1">{errores.titulo}</p>}
          </div>

          <div className="form-section">
            <label className="form-label">
              Archivo PDF <span className="required">*</span>
            </label>
            <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-md px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
              <IconUpload className="shrink-0" />
              {archivo ? (
                <span className="flex items-center gap-2 min-w-0">
                  <IconFileText className="text-bomberos shrink-0" />
                  <span className="truncate">
                    {archivo.name} ({formatearTamanoArchivo(archivo.size)})
                  </span>
                </span>
              ) : (
                "Seleccionar PDF..."
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleArchivo}
                className="hidden"
              />
            </label>
            {errores.archivo && <p className="text-xs text-red-600 mt-1">{errores.archivo}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3 mt-6">
            <button type="button" className="btn-cancel w-full sm:w-auto justify-center" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="btn-save w-full sm:w-auto justify-center">
              {guardando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
