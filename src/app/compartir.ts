import { Capacitor } from '@capacitor/core';
import { CapacitorShareTarget } from '@capgo/capacitor-share-target';

export interface Compartido {
  texto: string;
  fotos: File[];
}

/**
 * Recibe lo que compartes con "Chollos" desde otras apps (botón Compartir de Android):
 * el enlace o título de un anuncio de Vinted, o capturas seleccionadas en la galería.
 * El plugin copia los archivos a la caché de la app; aquí los convertimos en File.
 */
export async function escucharCompartir(alRecibir: (c: Compartido) => void): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return;

  await CapacitorShareTarget.addListener('shareReceived', async (evento) => {
    const textos = [evento.title, ...(evento.texts ?? [])].filter((t): t is string => !!t?.trim());

    const fotos: File[] = [];
    for (const archivo of evento.files ?? []) {
      if (!archivo.mimeType?.startsWith('image/')) continue;
      try {
        const ruta = archivo.uri.startsWith('file://') ? archivo.uri : 'file://' + archivo.uri;
        const respuesta = await fetch(Capacitor.convertFileSrc(ruta));
        const blob = await respuesta.blob();
        fotos.push(new File([blob], archivo.name || 'captura.jpg', { type: archivo.mimeType }));
      } catch (e) {
        console.error('No se pudo leer la imagen compartida', e);
      }
    }

    alRecibir({ texto: [...new Set(textos)].join('\n'), fotos });
  });
}
