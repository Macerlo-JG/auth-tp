// Convierte un File (por ejemplo, de un <input type="file">) a un data URL
// en base64. Se usa para simular, del lado del cliente, el guardado del
// PDF en el campo "contenido" mientras no existe un backend real que
// reciba el archivo por multipart/form-data.
export function archivoADataUrl(file) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer el archivo"));
    lector.readAsDataURL(file);
  });
}

export function esArchivoPdf(file) {
  return file?.type === "application/pdf";
}

export function formatearTamanoArchivo(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
