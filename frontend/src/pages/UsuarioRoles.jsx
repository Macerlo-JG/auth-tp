import { useEffect, useState } from "react";
import { IconTrash } from "../components/icons";
import ModalAgregarRol from "../components/ModalAgregarRol";

export default function UsuarioRoles({
    roles,
    setRoles,
    idUsuario,}) 
    {
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleEliminar = (idRol) => {
        setRoles((actuales) =>
            actuales.filter((rol) => rol.id_rol !== idRol)
        );
    };
    
    const agregarRol = (rol) => {
    setRoles((actuales) => {
        if (actuales.some(r => r.id_rol === rol.id_rol)) {
            return actuales;
        }

        return [...actuales, rol];
    });
};

    return (
        <>
            <h2 className="form-section-title ">
                Roles
            </h2>
            <div className="space-y-2">
                {roles.length === 0 ? (
                    <p className="text-gray-500">
                        El usuario no posee roles.
                    </p>
                ) : (
                    roles.map((rol) => (
                        <div key={rol.id_rol} className="flex justify-between items-center border rounded-md px-4 py-2">
                            <span>{rol.nombre}</span>
                            <button
                                type="button" onClick={() => handleEliminar(rol.id_rol)} className="text-red-600 hover:text-red-700">
                                <IconTrash />
                            </button>
                        </div>
                    ))
                )}
                <button type="button" className="btn-bomberos mt-3" onClick={() => setMostrarModal(true)}>+ Agregar Rol</button>
            </div>
            {mostrarModal && (<ModalAgregarRol
                idUsuario={idUsuario}
                onClose={() => setMostrarModal(false)}
                onRolAgregado={agregarRol}/>)}
        </>
    );

}