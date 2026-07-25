import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import {
  IconPerson,
  IconBuilding,
  IconHeart,
  IconSave,
} from "../components/icons.jsx";
import { editarUsuario, ESTADOS_USUARIO } from "../api/usuarios.js";
import { parseApiError } from "../auth/utils/parse.js";
import { formatearId, formatearFecha } from "../utils/format.js";
import UsuarioRoles from "../components/UsuarioRoles.jsx";
import { getUsuarioDetalle } from "../services/usuariosService";
import { guardarRolesUsuario } from "../services/usuarioRolesService.js";
import { HOME_ROUTE } from "../auth/config.js";
import ConfirmarCambioEstado from "../components/ConfirmarCambioEstado.jsx";

export default function EditarUsuarioPage() {
  // Hooks

  // -----Obtiene el id recibido por la URL.
  const { id } = useParams();

  // Permite realizar redirecciones.
  const navigate = useNavigate();

  // Referencia al formulario para acceder a sus datos
  // y utilizar las validaciones.
  const formRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [rolesOriginales, setRolesOriginales] = useState([]);

  // Roles actualmente seleccionados en la interfaz.
  const [rolesUsuario, setRolesUsuario] = useState([]);

  //notificación de bloquear usuario
  const [estadoAConfirmar, setEstadoAConfirmar] = useState(null);

  // Carga la informacion del usuario al iniciar la pagina
  // y guarda una copia de los roles originales para compararlos con los cambios realizados durante la edición.
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuario = await getUsuarioDetalle(id);

        if (!usuario) {
          toast.error("Usuario no encontrado");
          navigate("/usuarios");
          return;
        }

        setUsuario(usuario);
        setRolesOriginales(usuario.roles.map((rol) => ({ ...rol })));
        setRolesUsuario(usuario.roles.map((rol) => ({ ...rol })));
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar usuario");
        navigate({ HOME_ROUTE });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, navigate]);

  // Guarda los cambios. Actualiza los datos generales y sincroniza los roles.
  const handleGuardar = async () => {
    const form = formRef.current;

    //Validaciones de formulario
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Datos del formulario
    const data = Object.fromEntries(new FormData(form));

    // creo obj para api
    const jsonData = {
      estado_usuario: data.estado_usuario,
    };

    if (data.id_persona) {
      jsonData.id_persona = parseInt(data.id_persona, 10);
    }

    try {
      // Actualiza la informacion del usuario.
      const { ok, body } = await editarUsuario(usuario.id_usuario, jsonData);

      if (ok) {
        //Sincronizo cambios realizados en roles.
        await guardarRolesUsuario(usuario.id_usuario, rolesOriginales, rolesUsuario);
        toast.success(body.message || "Usuario actualizado");
        navigate("/usuarios");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };


  // Reemplazar handleCambiarEstadoRapido por estas dos funciones:
  const handlePedirConfirmacion = (nuevoEstado) => {
    setEstadoAConfirmar(nuevoEstado);
  };

  const handleConfirmarCambioEstado = async () => {
    const nuevoEstado = estadoAConfirmar;
    setEstadoAConfirmar(null);

    try {
      const { ok, body } = await editarUsuario(usuario.id_usuario, {
        estado_usuario: nuevoEstado,
      });

      if (ok) {
        toast.success(body.message || "Estado actualizado");
        navigate("/usuarios");
      } else {
        toast.error(parseApiError(body.message));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };




  if (cargando) {
    return (
      <Layout>
        <p className="text-center text-gray-500 py-12">Cargando...</p>
      </Layout>
    );
  }

  // Un administrador no se puede bloquear ni inactivar, así que ni
  // siquiera mostramos los botones si el usuario tiene ese rol.
  const esAdministrador = usuario.roles?.some((rol) => rol.nombre === "ADMINISTRADOR");

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Usuarios", to: "/usuarios" }, { label: "Editar" }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Editar Usuario {formatearId(usuario.id_usuario)} / {usuario.persona.nombre} {usuario.persona.apellido}
        </h1>
        <p className="text-gray-500 mt-1">Modifique el estado y los datos del usuario.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        <form ref={formRef}>

          <section className="form-section">
            <UsuarioRoles idUsuario={usuario.id_usuario} roles={rolesUsuario} setRoles={setRolesUsuario} />
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconPerson className="text-bomberos" />
              Datos de identificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">ID Persona</label>
                <input type="number" disabled name="id_persona" defaultValue={usuario.id_persona} className="form-input cursor-not-allowed" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconBuilding className="text-bomberos" />
              Estado y control
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">
                  Estado <span className="required">*</span>
                </label>
                <select name="estado_usuario" required defaultValue={usuario.estado_usuario} className="form-input">
                  {ESTADOS_USUARIO.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">ID Usuario modificador</label>
                <input type="number" name="updated_by" value={1} readOnly disabled className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>

            {/* Si es administrador, no se muestran los botones de
                bloquear/inactivar: un admin no se puede tocar así. */}
            {!esAdministrador && (
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handlePedirConfirmacion("BLOQUEADO")}
                  className="btn-cancel border border-red-300 text-red-700 hover:bg-red-50"
                >
                  Bloquear usuario
                </button>
                <button
                  type="button"
                  onClick={() => handlePedirConfirmacion("INACTIVO")}
                  className="btn-cancel border border-gray-400 text-gray-700 hover:bg-gray-100"
                >
                  Marcar como inactivo
                </button>
              </div>
            )}
          </section>

          <section className="form-section">
            <h2 className="form-section-title">
              <IconHeart className="text-bomberos" />
              Auditoría
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Creado por</label>
                <input type="text" disabled value={usuario.created_by} className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="form-label">Fecha de creación</label>
                <input type="text" disabled value={formatearFecha(usuario.created_at)} className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="form-label">Última actualización</label>
                <input type="text" disabled value={formatearFecha(usuario.updated_at)} className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate("/usuarios")} className="btn-cancel">Cancelar</button>
            <button type="button" onClick={handleGuardar} className="btn-save">
              <IconSave />
              Guardar usuario
            </button>
          </div>
        </form>
      </div>

      {estadoAConfirmar && (
        <ConfirmarCambioEstado
          nuevoEstado={estadoAConfirmar}
          onCancelar={() => setEstadoAConfirmar(null)}
          onConfirmar={handleConfirmarCambioEstado}
        />
      )}

    </Layout>
  );
}