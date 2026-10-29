/**
 * Reduce una imagen a un lado máximo y la devuelve como JPEG en base64 (sin la cabecera data:).
 * Así cada foto gasta menos tokens y la llamada es más rápida.
 */
export async function imagenABase64(archivo: File, ladoMaximo = 1280): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

/** Miniatura pequeña para el historial. */
export async function miniatura(archivo: File): Promise<string> {
  return 'data:image/jpeg;base64,' + (await imagenABase64(archivo, 160));
}
