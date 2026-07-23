// Visor de PDF embebido. "contenido" es un data URL (data:application/pdf;base64,...)
// mientras se usa el backend simulado. Cuando exista el backend real, lo más
// probable es que "contenido" pase a ser una URL http normal al archivo —
// este componente funciona igual en ambos casos, un <iframe> renderiza
// cualquiera de las dos.
export default function VisorPdf({ contenido, titulo }) {
  if (!contenido) {
    return (
      <div className="w-full h-full flex items-center justify-center border border-gray-200 rounded-md text-gray-400 text-sm">
        No hay contenido para mostrar.
      </div>
    );
  }

  return (
    <iframe
      src={contenido}
      title={titulo || "Documento"}
      className="w-full h-full border border-gray-200 rounded-md"
    />
  );
}
