import { Component, input } from '@angular/core';

export type NombreIlustracion = 'bienvenida' | 'evaluar' | 'avisos' | 'cola' | 'cartera' | 'historial' | 'clave';

/** Destello de cuatro puntas con lados curvos (el mismo motivo del logotipo). */
const destello = (x: number, y: number, s: number): string =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;

/**
 * Ilustraciones de línea fina (trazo de 2 px, sin relleno) con un acento coral.
 * Los colores salen de variables CSS (--ilu-*), así se adaptan solas al modo oscuro.
 * Son decorativas: el texto de al lado ya explica lo mismo, por eso van ocultas a lectores de pantalla.
 */
@Component({
  selector: 'app-ilustracion',
  template: `
    <svg viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      <path class="fondo" d="M28 78C26 42 58 20 98 20s76 20 76 58-30 50-74 50S30 112 28 78Z" />
      @switch (nombre()) {
        @case ('bienvenida') {
          <path class="acento" d="M66 70C52 74 44 86 38 104" />
          <path class="papel trazo" d="M58 70 80 46h66a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H80Z" />
          <circle class="trazo" cx="76" cy="70" r="5" />
          <path class="trazo" d="M96 62h40M96 76h24" />
          <path class="relleno-acento" [attr.d]="d(160, 34, 10)" />
          <path class="relleno-acento" [attr.d]="d(44, 40, 6)" />
          <path class="relleno-acento" [attr.d]="d(170, 108, 5)" />
        }
        @case ('evaluar') {
          <rect class="papel trazo" x="66" y="16" width="62" height="108" rx="13" />
          <rect class="trazo" x="76" y="30" width="42" height="32" rx="5" />
          <path class="trazo" d="M78 58l12-12 8 8 6-6 12 10" />
          <path class="trazo" d="M77 74h40M77 84h26" />
          <rect class="acento" x="77" y="98" width="40" height="13" rx="6.5" />
          <circle class="papel trazo" cx="138" cy="84" r="17" />
          <path class="trazo" d="M150 96l13 13" />
          <path class="relleno-acento" [attr.d]="d(138, 84, 7)" />
          <path class="relleno-acento" [attr.d]="d(152, 30, 9)" />
          <path class="relleno-acento" [attr.d]="d(50, 52, 5)" />
        }
        @case ('avisos') {
          <path class="trazo" d="M100 20v8" />
          <path class="papel trazo" d="M100 28c-17 0-29 13-29 31v17l-10 14h78l-10-14V59c0-18-12-31-29-31Z" />
          <path class="trazo" d="M90 96a10 10 0 0 0 20 0" />
          <path class="acento" d="M58 40a44 44 0 0 0-9 28M142 40a44 44 0 0 1 9 28" />
          <circle class="relleno-acento" cx="122" cy="40" r="7" />
          <path class="relleno-acento" [attr.d]="d(160, 28, 8)" />
        }
        @case ('cola') {
          <rect class="papel trazo tenue" x="64" y="24" width="82" height="54" rx="10" />
          <rect class="papel trazo" x="57" y="38" width="88" height="58" rx="11" />
          <rect class="papel trazo" x="50" y="54" width="98" height="62" rx="12" />
          <rect class="trazo" x="60" y="64" width="26" height="26" rx="6" />
          <path class="trazo" d="M95 70h40M95 82h26" />
          <rect class="acento" x="95" y="94" width="32" height="12" rx="6" />
          <path class="relleno-acento" [attr.d]="d(160, 34, 9)" />
        }
        @case ('cartera') {
          <path class="papel trazo" d="M54 62h92v48a8 8 0 0 1-8 8H62a8 8 0 0 1-8-8Z" />
          <path class="papel trazo" d="M48 62l10-16h84l10 16Z" />
          <path class="trazo" d="M88 80h24" />
          <path class="acento" d="M66 34l18-10 14 8 22-16" />
          <path class="acento" d="M112 16h8v8" />
          <ellipse class="papel acento" cx="162" cy="110" rx="14" ry="5" />
          <path class="acento" d="M148 110v-8M176 110v-8" />
          <ellipse class="papel acento" cx="162" cy="102" rx="14" ry="5" />
          <path class="acento" d="M148 102v-8M176 102v-8" />
          <ellipse class="papel acento" cx="162" cy="94" rx="14" ry="5" />
        }
        @case ('historial') {
          <circle class="papel trazo" cx="76" cy="72" r="32" />
          <path class="trazo" d="M76 52v20l14 9" />
          <rect class="papel trazo" x="112" y="38" width="56" height="70" rx="10" />
          <path class="acento" d="M121 56l4 4 7-8M121 74l4 4 7-8M121 92l4 4 7-8" />
          <path class="trazo" d="M140 56h18M140 74h14M140 92h18" />
          <path class="relleno-acento" [attr.d]="d(44, 36, 7)" />
        }
        @case ('clave') {
          <circle class="papel trazo" cx="72" cy="70" r="22" />
          <circle class="trazo" cx="72" cy="70" r="7" />
          <path class="trazo" d="M94 70h60M136 70v14M148 70v10" />
          <path class="relleno-acento" [attr.d]="d(156, 40, 10)" />
          <path class="relleno-acento" [attr.d]="d(46, 38, 6)" />
          <path class="acento" d="M112 50c8-6 18-6 26 0" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: block; width: 100%; max-width: 220px; margin: 0 auto; }
    svg { display: block; width: 100%; height: auto; }
    .fondo { fill: var(--ilu-fondo); }
    .papel { fill: var(--ilu-papel); }
    .trazo { fill: none; stroke: var(--ilu-trazo); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .papel.trazo, .papel.acento { fill: var(--ilu-papel); }
    .tenue { opacity: 0.55; }
    .acento { fill: none; stroke: var(--ilu-acento); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .relleno-acento { fill: var(--ilu-acento); }
  `,
})
export class IlustracionComponent {
  readonly nombre = input.required<NombreIlustracion>();
  protected readonly d = destello;
}
