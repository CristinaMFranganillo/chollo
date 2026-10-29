import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonCard, IonCardContent, IonBadge } from '@ionic/angular/standalone';
import { Evaluacion } from './models';
import { colorNota } from './colores';
import { esChollazo } from './chollazo';
import { abrirEnlace, comparables } from './enlaces';

/** Tarjeta con el resultado de una evaluación. Se reutiliza en Evaluar, Cola e Historial. */
@Component({
  selector: 'app-resultado',
  imports: [
    DecimalPipe, IonCard, IonCardContent, IonBadge,
  ],
  template: `
    @let r = evaluacion();
    <ion-card [class.chollazo]="chollazo(r)">
      @if (chollazo(r)) {
        <div class="banda-chollazo" role="status">¡CHOLLAZO! Muévete rápido</div>
      }
      <ion-card-content>
        <div class="cabecera-nota">
          <ion-badge [color]="color(r.nota)">{{ r.nota }}</ion-badge>
          <span class="multiplo" [attr.aria-label]="'Multiplica por ' + (r.multiplo | number: '1.1-1')">×{{ r.multiplo | number: '1.1-1' }}</span>
          <span class="categoria">{{ r.categoria }}</span>
        </div>

        <p class="beneficio" [class.negativo]="r.beneficio_neto_eur < 0">
          <strong>{{ r.beneficio_neto_eur >= 0 ? '+' : '' }}{{ r.beneficio_neto_eur | number: '1.0-0' }} €</strong>
          <span>de beneficio estimado</span>
        </p>
        <p class="motivo">{{ r.motivo }}</p>

        <div class="cifras">
          <div><span>Coste total</span><strong>{{ r.coste_total_eur | number: '1.0-2' }} €</strong></div>
          <div><span>Ingreso neto</span><strong>{{ r.ingreso_neto_eur | number: '1.0-2' }} €</strong></div>
          @if (r.oferta_maxima_eur != null) {
            <div><span>Oferta máxima</span><strong>{{ r.oferta_maxima_eur | number: '1.0-2' }} €</strong></div>
          }
        </div>

        @if (r.piezas.length) {
          <h3>Qué hay</h3>
          @for (p of r.piezas; track $index) {
            <div class="pieza">
              <div class="pieza-cabecera">
                <strong>{{ p.nombre }}</strong>
                <span class="confianza" [class.segura]="p.confianza === 'segura'">{{ p.confianza }}</span>
              </div>
              <p>{{ p.precio_min_eur | number: '1.0-0' }}–{{ p.precio_max_eur | number: '1.0-0' }} € · {{ p.fuente }}</p>
              <div class="comparables">
                <span>Ver vendidos</span>
                <button type="button" class="chip" (click)="abrir(enlaces.ebay(p.nombre))">eBay</button>
                <button type="button" class="chip" (click)="abrir(enlaces.todocoleccion(p.nombre))">todocoleccion</button>
                <button type="button" class="chip" (click)="abrir(enlaces.wallapop(p.nombre))">Wallapop</button>
                @if (esLibro(r.categoria)) {
                  <button type="button" class="chip" (click)="abrir(enlaces.iberlibro(p.nombre))">Iberlibro</button>
                }
              </div>
            </div>
          }
        }

        <h3>Revender o guardar</h3>
        <p>{{ r.revender_o_guardar }}</p>
        <h3>Cómo venderlo</h3>
        <p>{{ r.como_venderlo }}</p>

        @if (r.riesgos.length) {
          <h3>Riesgos</h3>
          <ul>
            @for (x of r.riesgos; track $index) { <li>{{ x }}</li> }
          </ul>
        }
        @if (r.preguntas_vendedor.length) {
          <h3>Preguntas al vendedor</h3>
          <ul>
            @for (x of r.preguntas_vendedor; track $index) { <li>{{ x }}</li> }
          </ul>
        }
        <ng-content />
      </ion-card-content>
    </ion-card>
  `,
  styles: `
    ion-card { max-width: 640px; margin-inline: auto; }
    ion-card-content { padding: 18px; color: var(--tinta); }
    ion-card.chollazo { box-shadow: 0 0 0 3px #e0002a, 0 6px 20px rgba(224, 0, 42, 0.35); }
    .banda-chollazo {
      padding: 10px 16px; text-align: center; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.02em;
      color: #fff; background: linear-gradient(90deg, #c8001f, #c84a00);
    }
    .cabecera-nota { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .cabecera-nota ion-badge { font-size: 0.85rem; }
    .multiplo {
      padding: 4px 10px; border-radius: 999px; background: var(--campo);
      font-size: 0.9rem; font-weight: 800; color: var(--tinta);
    }
    .categoria { margin-left: auto; font-size: 0.8rem; font-weight: 600; color: var(--tinta-suave); }
    .beneficio { margin: 16px 0 2px; display: flex; flex-direction: column; }
    .beneficio strong { font-size: 2.6rem; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em; color: var(--ion-color-success); }
    .beneficio.negativo strong { color: var(--ion-color-danger); }
    .beneficio span { font-size: 0.9rem; font-weight: 600; color: var(--tinta-suave); }
    .motivo { margin: 10px 0 14px; font-size: 0.95rem; line-height: 1.5; color: var(--tinta); }
    .cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px; margin-bottom: 4px; }
    .cifras div { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 14px; background: var(--campo); }
    .cifras span { font-size: 0.75rem; font-weight: 600; color: var(--tinta-suave); }
    .cifras strong { font-size: 1.1rem; font-weight: 800; }
    h3 {
      margin: 20px 0 8px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--tinta-suave);
    }
    p { line-height: 1.5; }
    ul { margin: 0; padding-left: 20px; line-height: 1.5; }
    li { margin-bottom: 4px; }
    .pieza { padding: 12px; margin-bottom: 8px; border-radius: 14px; border: 1px solid rgba(var(--ion-text-color-rgb), 0.08); }
    .pieza-cabecera { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .pieza p { margin: 4px 0 8px; font-size: 0.85rem; color: var(--tinta-suave); }
    .confianza { flex: none; padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: var(--campo); color: var(--tinta-suave); }
    .confianza.segura { background: rgba(var(--ion-color-success-rgb), 0.14); color: var(--ion-color-success); }
    .comparables { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    .comparables span { font-size: 0.75rem; font-weight: 600; color: var(--tinta-suave); margin-right: 2px; }
    .chip {
      min-height: 30px; padding: 0 12px; border: 0; border-radius: 999px; cursor: pointer;
      background: var(--marca-petroleo-suave); color: var(--ion-color-primary); font: inherit; font-size: 0.8rem; font-weight: 700;
    }
    .chip:focus-visible { outline: 2px solid var(--ion-color-primary); outline-offset: 2px; }
  `,
})
export class ResultadoComponent {
  readonly evaluacion = input.required<Evaluacion>();
  protected readonly color = colorNota;
  protected readonly enlaces = comparables;
  protected readonly abrir = abrirEnlace;
  protected readonly chollazo = esChollazo;
  protected esLibro(categoria: string): boolean {
    return /libro/i.test(categoria);
  }
}
