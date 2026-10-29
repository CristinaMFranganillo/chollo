import { Injectable, signal } from '@angular/core';
import { Ajustes } from './models';

const CLAVE = 'chollos.ajustes';

const POR_DEFECTO: Ajustes = {
  apiKey: '',
  modelo: 'gemini-2.5-flash',
  modeloRapido: 'gemini-2.5-flash-lite',
  buscarPrecios: true,
  vigilar: false,
  demo: false,
};

/**
 * Guarda la clave de la API y las preferencias en el almacenamiento local del dispositivo.
 */
@Injectable({ providedIn: 'root' })
export class AjustesService {
  readonly ajustes = signal<Ajustes>(this.leer());

  guardar(nuevos: Ajustes): void {
    this.ajustes.set(nuevos);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevos));
    } catch {
      /* almacenamiento no disponible: se queda solo en memoria */
    }
  }

  private leer(): Ajustes {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? { ...POR_DEFECTO, ...JSON.parse(guardado) } : POR_DEFECTO;
    } catch {
      return POR_DEFECTO;
    }
  }
}
