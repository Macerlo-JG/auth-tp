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
                <div className="flex flex-wrap gap-3">
                        {roles.map((rol) => (
                        <div
                            key={rol.id_rol}
                            className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2"
                        >
                            <span>{rol.nombre}</span>

                            <button
                            type="button"
                            onClick={() => handleEliminar(rol.id_rol)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            >
                            <IconTrash />
                            </button>
                        </div>
                        ))}
                    </div>
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