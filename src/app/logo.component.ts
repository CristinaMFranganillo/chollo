import { Component, input } from '@angular/core';

/**
 * Logotipo de Chollos: una etiqueta de precio de trazo fino con un destello coral.
 * El mismo dibujo se usa para el icono de la app (android/.../ic_launcher_foreground.xml y public/icons).
 */
@Component({
  selector: 'app-logo',
  template: `
    <span class="logo" [class.grande]="grande()">
      <svg class="marca" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path class="etiqueta" d="M4.5 16 11 8.5h14.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H11Z" />
        <circle class="etiqueta" cx="10.5" cy="16" r="1.6" />
        <path class="destello" d="M20 11.5Q20 16 24.5 16Q20 16 20 20.5Q20 16 15.5 16Q20 16 20 11.5Z" />
      </svg>
      @if (conTexto()) {
        <span class="texto">Chollos</span>
      }
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .logo { display: inline-flex; align-items: center; gap: 8px; }
    .marca { width: 30px; height: 30px; padding: 3px; border-radius: 10px; background: var(--marca-petroleo-suave); }
    .etiqueta { fill: none; stroke: var(--marca-petroleo); stroke-width: 2; stroke-linejoin: round; }
    .destello { fill: var(--marca-coral); stroke: var(--marca-coral); stroke-width: 1; stroke-linejoin: round; }
    .texto { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; color: var(--tinta); }
    .grande .marca { width: 72px; height: 72px; padding: 10px; border-radius: 22px; }
    .grande .etiqueta { stroke-width: 1.6; }
    .grande .texto { font-size: 2rem; }
  `,
})
export class LogoComponent {
  readonly conTexto = input(true);
  readonly grande = input(false);
}
