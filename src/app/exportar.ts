import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Exporta un archivo de texto. En Android lo guarda en la caché y abre el menú Compartir
 * (para mandarlo a Drive, correo, WhatsApp…); en el navegador lo descarga.
 */
export async function exportarTexto(nombre: string, contenido: string, tipo = 'text/csv'): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: nombre,
      data: contenido,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: nombre, files: [uri] });
    return;
  }
  const url = URL.createObjectURL(new Blob([contenido], { type: `${tipo};charset=utf-8` }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
