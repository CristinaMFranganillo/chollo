import { Injectable, signal } from '@angular/core';
import { RegistroEvaluacion } from './models';
import { guardar, leer } from './almacen';

const CLAVE = 'chollos.historial';
const MAXIMO = 50;

/** Últimas evaluaciones, guardadas en el dispositivo (IndexedDB). */
@Injectable({ providedIn: 'root' })
export class HistorialService {
  readonly registros = signal<RegistroEvaluacion[]>([]);

  constructor() {
    leer<RegistroEvaluacion[]>(CLAVE, []).then((lista) =>
      // Si mientras cargaba ya se ha añadido algo, lo conservamos delante.
      this.registros.update((actual) => [...actual, ...lista].slice(0, MAXIMO)),
    );
  }

  anadir(registro: RegistroEvaluacion): void {
    this.actualizar([registro, ...this.registros()].slice(0, MAXIMO));
  }

  borrar(id: string): void {
    this.actualizar(this.registros().filter((r) => r.id !== id));
  }

  private actualizar(lista: RegistroEvaluacion[]): void {
    this.registros.set(lista);
    void guardar(CLAVE, lista);
  }
}
