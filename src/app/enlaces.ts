import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/** Abre una web: en Android en una pestaña del navegador dentro de la app; en web, en otra pestaña. */
export async function abrirEnlace(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

const q = (texto: string) => encodeURIComponent(texto.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim());

/** Búsquedas de artículos vendidos para comprobar precios reales. */
export const comparables = {
  ebay: (texto: string) => `https://www.ebay.es/sch/i.html?_nkw=${q(texto)}&LH_Sold=1&LH_Complete=1`,
  todocoleccion: (texto: string) => `https://www.todocoleccion.net/buscador?bu=${q(texto)}`,
  wallapop: (texto: string) => `https://es.wallapop.com/app/search?keywords=${q(texto)}`,
};

/** Búsquedas en las apps de segunda mano, para guardarlas y recibir notificaciones. */
export const buscarEn = {
  vinted: (texto: string) => `https://www.vinted.es/catalog?search_text=${q(texto)}&order=newest_first`,
  wallapop: (texto: string) => `https://es.wallapop.com/app/search?keywords=${q(texto)}&order_by=newest`,
};

/** Búsquedas recomendadas por categoría: genéricas, donde aparecen los chollos. */
export const BUSQUEDAS_RECOMENDADAS: { categoria: string; terminos: string[] }[] = [
  { categoria: 'Genéricas', terminos: ['vaciado trastero', 'vaciado piso', 'herencia', 'mudanza urge'] },
  { categoria: 'LEGO', terminos: ['lego al peso', 'caja lego variado', 'lego star wars completo', 'muñecos lego'] },
  { categoria: 'Retro', terminos: ['lote juegos game boy', 'consola antigua con juegos', 'game cube', 'nintendo 64 juegos'] },
  { categoria: 'Cuberterías', terminos: ['cubertería plata', 'cubiertos plata', 'cubertería antigua', 'plata 916', 'christofle', 'wmf 90'] },
  { categoria: 'Vajillas', terminos: ['vajilla pickman', 'vajilla sargadelos', 'vajilla limoges', 'vajilla porcelana antigua'] },
  { categoria: 'Menaje', terminos: ['le creuset', 'staub', 'cocotte hierro', 'cazo cobre'] },
  { categoria: 'Cristalería y jarrones', terminos: ['iittala', 'holmegaard', 'cristal murano firmado', 'west germany jarrón'] },
];
