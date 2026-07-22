import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AccionesChecklist from "./AccionesChecklist.jsx";
import { crearRol, actualizarRol } from "../../services/rolesService.js";
import { obtenerAcciones } from "../../services/accionesService.js";

// Formulario de alta/edición de un rol.
// En modo edición el nombre no se puede modificar: el backend sólo
// acepta descripcion e id_acciones al actualizar (RolUpdateSchema).
export default function FormularioRol({ rol, onCancelar, onGuardado }) {
  const esEdicion = Boolean(rol);

  // Catálogo completo de acciones para el checklist.
  const [acciones, setAcciones] = useState([]);
  const [cargandoAcciones, setCargandoAcciones] = useState(true);

  const [nombre, setNombre] = useState(rol?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "");
  const [idAcciones, setIdAcciones] = useState(
    rol?.acciones?.map((accion) => accion.id_accion) ?? []
  );

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Carga el catálogo de acciones disponibles al montar el formulario.
  useEffect(() => {
    const cargarAcciones = async () => {
      try {
        const lista = await obtenerAcciones();
        setAcciones(lista);
      } catch (err) {
        console.error(err);
        toast.error("No se pudo cargar el catálogo de acciones");
      } finally {
        setCargandoAcciones(false);
      }
    };

    cargarAcciones();
  }, []);

  // Validaciones equivalentes a las del backend (RolCreateSchema /
  // RolUpdateSchema), para dar feedback inmediato antes de enviar.
  const validar = () => {
    const nuevosErrores = {};

    if (!esEdicion && !nombre.trim()) {
      nuevosErrores.nombre = "El nombre del rol es obligatorio";
    }

    if (!descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción del rol es obligatoria";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    setGuardando(true);

    try {
      if (esEdicion) {
        await actualizarRol(rol.id_rol, {
          descripcion: descripcion.trim(),
          id_acciones: idAcciones,
        });
        toast.success("Rol actualizado");
      } else {
        await crearRol({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          id_acciones: idAcciones,
        });
        toast.success("Rol creado");
      }

      onGuardado();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "No se pudo guardar el rol");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="form-label">
          Nombre <span className="required">*</span>
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={esEdicion}
          placeholder="Ej: DOCENTE"
          className="form-input w-full disabled:bg-gray-100 disabled:text-gray-500"
        />
        {esEdicion ? (
          <p className="text-xs text-gray-500 mt-1">
            El nombre de un rol no se puede modificar una vez creado.
          </p>
        ) : (
          errores.nombre && (
            <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>
          )
        )}
      </div>

      <div className="form-section">
        <label className="form-label">
          Descripción <span className="required">*</span>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          placeholder="Describí brevemente el propósito del rol"
          className="form-input w-full"
        />
        {errores.descripcion && (
          <p className="text-xs text-red-600 mt-1">{errores.descripcion}</p>
        )}
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Acciones</h3>

        {cargandoAcciones ? (
          <p className="text-gray-500 text-sm">Cargando acciones...</p>
        ) : (
          <AccionesChecklist
            acciones={acciones}
            seleccionadas={idAcciones}
            onChange={setIdAcciones}
          />
        )}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button type="button" className="btn-cancel" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="btn-save">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
