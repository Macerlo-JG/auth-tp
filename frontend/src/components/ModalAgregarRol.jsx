import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {getRolesDisponibles} from "../services/rolesService";
import { agregarRolUsuario } from "../api/roles";


export default function ModalAgregarRol({
    idUsuario,
    onClose,
    onRolAgregado
}) {

    const [roles, setRoles] = useState([]);
    const [rolSeleccionado, setRolSeleccionado] = useState("");
    
    useEffect(() => {cargarRoles();
    }, []);

    const cargarRoles = async () => {
        const lista = await getRolesDisponibles(idUsuario);
        setRoles(lista);
        if (lista.length > 0)
            setRolSeleccionado(lista[0].id_rol);
    };

  const handleAgregar = () => {
    const rol = roles.find(
        r => r.id_rol === Number(rolSeleccionado)
    );

    if (!rol) return;

    onRolAgregado(rol);
    onClose();
};

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white rounded-lg w-[420px] p-6">
                <h2 className="text-xl font-bold mb-5">
                    Agregar Rol
                </h2>
                {roles.length === 0 ? (
                    <p>
                        No hay roles disponibles.
                    </p>
                ):(
                    <>
                        <label className="form-label">
                            Rol
                        </label>
                        <select value={rolSeleccionado} onChange={(e) =>  setRolSeleccionado(e.target.value)} className="form-input">
                            {roles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                    type="button"
                    onClick={handleAgregar}
                    className="btn-bomberos"
                    >
                    Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}