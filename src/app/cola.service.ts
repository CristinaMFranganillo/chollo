import { Injectable, computed, inject, signal } from '@angular/core';
import { GeminiService } from './gemini.service';
import { HistorialService } from './historial.service';
import { ElementoCola, ORDEN_NOTA } from './models';
import { miniatura } from './imagenes';

/**
 * Cola de anuncios: añades varios (cada uno con sus capturas) y los evalúa uno detrás de otro.
 * Los resultados se ordenan de mejor a peor.
 */
@Injectable({ providedIn: 'root' })
export class ColaService {
  private readonly gemini = inject(GeminiService);
  private readonly historial = inject(HistorialService);

  readonly elementos = signal<ElementoCola[]>([]);
  readonly procesando = signal(false);

  readonly pendientes = computed(
    () => this.elementos().filter((e) => e.estado === 'pendiente' || e.estado === 'error').length,
  );

  /** Ordenados: primero los que esperan, luego los evaluados de mejor a peor nota y beneficio. */
  readonly ordenados = computed(() =>
    [...this.elementos()].sort((a, b) => {
      const peso = (e: ElementoCola) =>
        e.evaluacion ? ORDEN_NOTA[e.evaluacion.nota] ?? 9 : e.estado === 'error' ? 10 : -1;
      const diferencia = peso(a) - peso(b);
      if (diferencia !== 0) return diferencia;
      return (b.evaluacion?.beneficio_neto_eur ?? 0) - (a.evaluacion?.beneficio_neto_eur ?? 0);
    }),
  );

  async anadir(texto: string, precio: number | null, fotos: File[]): Promise<void> {
    const elemento: ElementoCola = {
      id: crypto.randomUUID(),
      texto,
      precio,
      fotos,
      miniatura: fotos[0] ? await miniatura(fotos[0]) : null,
      estado: 'pendiente',
    };
    this.elementos.update((lista) => [...lista, elemento]);
  }

  quitar(id: string): void {
    this.elementos.update((lista) => lista.filter((e) => e.id !== id));
  }

  vaciarEvaluados(): void {
    this.elementos.update((lista) => lista.filter((e) => e.estado !== 'hecho'));
  }

  /** Evalúa en serie (una llamada cada vez) para no saturar la cuota gratuita. */
  async procesar(): Promise<void> {
    if (this.procesando()) return;
    this.procesando.set(true);
    try {
      for (const elemento of this.elementos()) {
        if (elemento.estado !== 'pendiente' && elemento.estado !== 'error') continue;
        this.actualizar(elemento.id, { estado: 'evaluando', error: undefined });
        try {
          const evaluacion = await this.gemini.evaluar(elemento.texto, elemento.precio, elemento.fotos);
          this.actualizar(elemento.id, { estado: 'hecho', evaluacion });
          this.historial.anadir({
            id: elemento.id,
            fecha: new Date().toISOString(),
            titulo: elemento.texto.split('\n')[0].slice(0, 60) || evaluacion.categoria,
            precio: elemento.precio,
            miniatura: elemento.miniatura,
            evaluacion,
          });
        } catch (e) {
          this.actualizar(elemento.id, {
            estado: 'error',
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } finally {
      this.procesando.set(false);
    }
  }

  private actualizar(id: string, cambios: Partial<ElementoCola>): void {
    this.elementos.update((lista) => lista.map((e) => (e.id === id ? { ...e, ...cambios } : e)));
  }
}
