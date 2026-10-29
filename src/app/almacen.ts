import { get, set } from 'idb-keyval';

/**
 * Almacenamiento persistente con IndexedDB (más espacio y más fiable que localStorage,
 * importante para miniaturas e historial). Funciona igual en el navegador y en la app Android.
 * La primera vez migra lo que hubiera en localStorage con la misma clave.
 */
export async function leer<T>(clave: string, porDefecto: T): Promise<T> {
  try {
    const valor = await get<T>(clave);
    if (valor !== undefined) return valor;
    const antiguo = localStorage.getItem(clave);
    if (antiguo) {
      const migrado = JSON.parse(antiguo) as T;
      await set(clave, migrado);
      localStorage.removeItem(clave);
      return migrado;
    }
  } catch (e) {
    console.warn('No se pudo leer', clave, e);
  }
  return porDefecto;
}

export async function guardar<T>(clave: string, valor: T): Promise<void> {
  try {
    await set(clave, valor);
  } catch (e) {
    console.warn('No se pudo guardar', clave, e);
  }
}
