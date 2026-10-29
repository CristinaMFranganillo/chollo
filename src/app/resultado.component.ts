import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonList,
  IonItem, IonLabel, IonNote,
} from '@ionic/angular/standalone';
import { Evaluacion } from './models';
import { colorNota } from './colores';

/** Tarjeta con el resultado de una evaluación. Se reutiliza en Evaluar, Cola e Historial. */
@Component({
  selector: 'app-resultado',
  imports: [
    DecimalPipe, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge,
    IonList, IonItem, IonLabel, IonNote,
  ],
  template: `
    @let r = evaluacion();
    <ion-card>
      <ion-card-header>
        <div class="cabecera-nota">
          <ion-badge [color]="color(r.nota)">{{ r.nota }}</ion-badge>
          <span class="multiplo">× {{ r.multiplo | number: '1.1-1' }}</span>
        </div>
        <ion-card-title>
          {{ r.beneficio_neto_eur >= 0 ? '+' : '' }}{{ r.beneficio_neto_eur | number: '1.0-0' }} € de beneficio estimado
        </ion-card-title>
        <ion-card-subtitle>{{ r.categoria }} · {{ r.motivo }}</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <div class="cifras">
          <div><span>Coste total</span><strong>{{ r.coste_total_eur | number: '1.0-2' }} €</strong></div>
          <div><span>Ingreso neto</span><strong>{{ r.ingreso_neto_eur | number: '1.0-2' }} €</strong></div>
          @if (r.oferta_maxima_eur != null) {
            <div><span>Oferta máxima</span><strong>{{ r.oferta_maxima_eur | number: '1.0-2' }} €</strong></div>
          }
        </div>

        @if (r.piezas.length) {
          <h3>Qué hay</h3>
          <ion-list lines="inset">
            @for (p of r.piezas; track $index) {
              <ion-item>
                <ion-label class="ion-text-wrap">
                  <h4>{{ p.nombre }} <ion-note>({{ p.confianza }})</ion-note></h4>
                  <p>{{ p.precio_min_eur | number: '1.0-0' }}–{{ p.precio_max_eur | number: '1.0-0' }} € · {{ p.fuente }}</p>
                </ion-label>
              </ion-item>
            }
          </ion-list>
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
    .cabecera-nota { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .cabecera-nota ion-badge { font-size: 1rem; padding: 6px 10px; }
    .multiplo { font-size: 1.25rem; font-weight: 600; }
    .cifras { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; }
    .cifras div { display: flex; flex-direction: column; }
    .cifras span { font-size: 0.8rem; color: var(--ion-color-medium); }
    .cifras strong { font-size: 1.1rem; }
    h3 { margin-top: 16px; font-weight: 600; }
  `,
})
export class ResultadoComponent {
  readonly evaluacion = input.required<Evaluacion>();
  protected readonly color = colorNota;
}
