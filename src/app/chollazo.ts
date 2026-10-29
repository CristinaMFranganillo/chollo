import { Injectable, signal } from '@angular/core';
import { Aviso, Evaluacion } from './models';

/**
 * "Chollazo": un CHOLLO excepcional que merece un aviso llamativo (pantalla completa en la app,
 * vibración larga y una notificación aparte en Android).
 * Mismo criterio que el servicio nativo (VigilanteService.java): si cambias uno, cambia el otro.
 */
export const MULTIPLO_CHOLLAZO = 5;
export const BENEFICIO_CHOLLAZO_EUR = 150;

export function esChollazo(e: Evaluacion): boolean {
  return (
    e.nota === 'CHOLLO' &&
    (e.chollazo === true || e.multiplo >= MULTIPLO_CHOLLAZO || e.beneficio_neto_eur >= BENEFICIO_CHOLLAZO_EUR)
  );
}

/** Los avisos de notificaciones solo traen nota y múltiplo (no hay beneficio en euros). */
export function avisoEsChollazo(a: Aviso): boolean {
  return a.nota === 'CHOLLO' && (a.chollazo === true || (a.multiplo ?? 0) >= MULTIPLO_CHOLLAZO);
}

export interface Alerta {
  titulo: string;
  detalle: string;
  /** Qué hacer al pulsar "Ver": la app decide (ir a la cola, a avisos…). */
  destino: 'evaluar' | 'cola' | 'avisos';
}

/** Alerta a pantalla completa. La muestra app.html; aquí solo se lanza. */
@Injectable({ providedIn: 'root' })
export class ChollazoService {
  readonly alerta = signal<Alerta | null>(null);

  avisar(alerta: Alerta): void {
    this.alerta.set(alerta);
    try {
      // Vibración larga e insistente (en la web o si el móvil no lo permite, no hace nada).
      navigator.vibrate?.([400, 150, 400, 150, 800]);
    } catch {
      // nada
    }
  }

  cerrar(): void {
    this.alerta.set(null);
  }
}
