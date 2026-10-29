import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem,
  IonLabel, IonList, IonModal, IonNote, IonSegment, IonSegmentButton, IonSelect, IonSelectOption,
  IonTextarea, IonThumbnail, IonTitle, IonToolbar, IonBadge, IonSpinner,
} from '@ionic/angular/standalone';
import { CarteraService } from './cartera.service';
import { AnuncioVenta, ArticuloCartera } from './models';
import { exportarTexto } from './exportar';
import { GeminiService } from './gemini.service';

type Filtro = 'stock' | 'guardar' | 'vendido' | 'todo';

/** Pestaña Cartera: lo que has comprado, lo que guardas y lo que has vendido, con el beneficio real. */
@Component({
  selector: 'app-cartera',
  imports: [
    FormsModule, DecimalPipe, DatePipe, PercentPipe,
    IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem,
    IonLabel, IonList, IonModal, IonNote, IonSegment, IonSegmentButton, IonSelect, IonSelectOption,
    IonTextarea, IonThumbnail, IonTitle, IonToolbar, IonBadge, IonSpinner,
  ],
  template: `
    @let r = cartera.resumen();
    <div class="resumen">
      <div><span>En stock</span><strong>{{ r.piezasStock }} {{ r.piezasStock === 1 ? 'pieza' : 'piezas' }}</strong></div>
      <div><span>Invertido</span><strong>{{ r.invertido | number: '1.0-0' }} €</strong></div>
      <div><span>Valor estimado</span><strong>{{ r.valorStock | number: '1.0-0' }} €</strong></div>
      <div><span>Ganancia latente</span>
        <strong [class.negativo]="r.plusvaliaLatente < 0">{{ r.plusvaliaLatente | number: '1.0-0' }} €</strong></div>
      <div><span>Vendidas</span><strong>{{ r.piezasVendidas }}</strong></div>
      <div><span>Beneficio real</span>
        <strong [class.negativo]="r.beneficio < 0">{{ r.beneficio | number: '1.0-0' }} €</strong></div>
      <div><span>Por hora</span><strong>{{ r.porHora != null ? (r.porHora | number: '1.0-1') + ' €/h' : '—' }}</strong></div>
      <div><span>Días hasta vender</span><strong>{{ r.diasMedios != null ? (r.diasMedios | number: '1.0-0') : '—' }}</strong></div>
    </div>

    @if (parados().length) {
      <div class="aviso-parado">
        <strong>{{ parados().length }} {{ parados().length === 1 ? 'artículo lleva' : 'artículos llevan' }} más de {{ diasParado }} días sin venderse.</strong>
        Plantéate bajar el precio, cambiar de canal o mejorar las fotos y el anuncio.
      </div>
    }

    @if (cartera.vendidos().length) {
      <details class="categorias">
        <summary>Rendimiento por categoría</summary>
        <table>
          <thead>
            <tr><th>Categoría</th><th>Vendidos</th><th>Beneficio</th><th>Rentab.</th><th>€/h</th><th>Días</th></tr>
          </thead>
          <tbody>
            @for (c of cartera.porCategoria(); track c.categoria) {
              <tr>
                <td>{{ c.categoria }}</td>
                <td>{{ c.vendidos }}/{{ c.compras }}</td>
                <td [class.negativo]="c.beneficio < 0">{{ c.beneficio | number: '1.0-0' }} €</td>
                <td>{{ c.rentabilidad != null ? (c.rentabilidad | percent: '1.0-0') : '—' }}</td>
                <td>{{ c.porHora != null ? (c.porHora | number: '1.0-0') : '—' }}</td>
                <td>{{ c.diasMedios != null ? (c.diasMedios | number: '1.0-0') : '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p class="nota-tabla">Rentabilidad = beneficio / coste de lo vendido. Para comparar nichos, mira sobre todo los euros por hora.</p>
      </details>
    }

    <div class="acciones">
      <ion-button (click)="abrir(cartera.nuevo())">
        <ion-icon aria-hidden="true" slot="start" name="add-circle-outline"></ion-icon> Añadir compra
      </ion-button>
      <ion-button fill="outline" [disabled]="!cartera.articulos().length" (click)="exportar()">Exportar CSV</ion-button>
    </div>

    <ion-segment [scrollable]="true" [value]="filtro()" (ionChange)="filtro.set($any($event.detail.value))">
      <ion-segment-button value="stock"><ion-label>Stock</ion-label></ion-segment-button>
      <ion-segment-button value="guardar"><ion-label>Guardado</ion-label></ion-segment-button>
      <ion-segment-button value="vendido"><ion-label>Vendido</ion-label></ion-segment-button>
      <ion-segment-button value="todo"><ion-label>Todo</ion-label></ion-segment-button>
    </ion-segment>

    @if (!filtrados().length) {
      <p class="vacio">
        Nada por aquí. Cuando compres algo, pulsa "Lo he comprado" en su evaluación o "Añadir compra".
      </p>
    }
    <ion-list>
      @for (a of filtrados(); track a.id) {
        <ion-item button [detail]="false" (click)="abrir(a)">
          @if (a.miniatura) {
            <ion-thumbnail slot="start"><img [src]="a.miniatura" alt="" /></ion-thumbnail>
          }
          <ion-label class="ion-text-wrap">
            <h3>{{ a.titulo || 'Sin título' }}</h3>
            <p>
              {{ a.fechaCompra | date: 'd MMM y' }} · coste {{ a.costeTotal | number: '1.0-2' }} €
              @if (a.estado === 'vendido') {
                · vendido por {{ a.precioVenta | number: '1.0-2' }} €
                ({{ (a.precioVenta ?? 0) - a.costeTotal | number: '1.0-0' }} €)
              } @else if (a.valorEstimado != null) {
                · vale ~{{ a.valorEstimado | number: '1.0-0' }} €
              }
            </p>
            @if (a.estado === 'en_stock') {
              <p [class.texto-aviso]="a.estrategia === 'revender' && dias(a) > diasParado">
                {{ dias(a) }} días en stock @if (a.ubicacion) { · Guardado en: {{ a.ubicacion }} }
              </p>
            }
          </ion-label>
          <ion-badge slot="end" [color]="a.estado === 'vendido' ? 'success' : a.estrategia === 'guardar' ? 'tertiary' : 'primary'">
            {{ a.estado === 'vendido' ? 'VENDIDO' : a.estrategia === 'guardar' ? 'GUARDAR' : 'REVENDER' }}
          </ion-badge>
        </ion-item>
      }
    </ion-list>

    <ion-modal [isOpen]="!!editando()" (didDismiss)="editando.set(null)">
      <ng-template>
        @if (editando(); as e) {
          <ion-header>
            <ion-toolbar>
              <ion-buttons slot="start"><ion-button (click)="editando.set(null)">Cancelar</ion-button></ion-buttons>
              <ion-title>{{ e.titulo || 'Nueva compra' }}</ion-title>
              <ion-buttons slot="end"><ion-button [strong]="true" (click)="guardar(e)">Guardar</ion-button></ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-list lines="full">
              <ion-item><ion-input label="Qué es" labelPlacement="stacked" [(ngModel)]="e.titulo"></ion-input></ion-item>
              <ion-item><ion-input label="Categoría" labelPlacement="stacked" [(ngModel)]="e.categoria"></ion-input></ion-item>
              <ion-item>
                <ion-select label="Estrategia" labelPlacement="stacked" [(ngModel)]="e.estrategia" interface="popover">
                  <ion-select-option value="revender">Revender</ion-select-option>
                  <ion-select-option value="guardar">Guardar (inversión)</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item><ion-input label="Fecha de compra" labelPlacement="stacked" type="date" [(ngModel)]="e.fechaCompra"></ion-input></ion-item>
              <ion-item><ion-input label="Coste total (€, con tasas y envío)" labelPlacement="stacked" inputmode="decimal" [(ngModel)]="e.costeTotal"></ion-input></ion-item>
              <ion-item><ion-input label="Valor estimado de reventa (€)" labelPlacement="stacked" inputmode="decimal" [(ngModel)]="e.valorEstimado"></ion-input></ion-item>
              <ion-item><ion-input label="Dónde está guardado" labelPlacement="stacked" [(ngModel)]="e.ubicacion"></ion-input></ion-item>
              <ion-item>
                <ion-select label="Estado" labelPlacement="stacked" [(ngModel)]="e.estado" interface="popover">
                  <ion-select-option value="en_stock">En stock</ion-select-option>
                  <ion-select-option value="vendido">Vendido</ion-select-option>
                </ion-select>
              </ion-item>
              @if (e.estado === 'vendido') {
                <ion-item><ion-input label="Precio de venta neto (€, tras comisiones y envío)" labelPlacement="stacked" inputmode="decimal" [(ngModel)]="e.precioVenta"></ion-input></ion-item>
                <ion-item><ion-input label="Dónde lo vendiste" labelPlacement="stacked" placeholder="Wallapop, todocoleccion…" [(ngModel)]="e.canalVenta"></ion-input></ion-item>
                <ion-item><ion-input label="Fecha de venta" labelPlacement="stacked" type="date" [(ngModel)]="e.fechaVenta"></ion-input></ion-item>
                <ion-item><ion-input label="Horas dedicadas (buscar, recoger, fotos, envío…)" labelPlacement="stacked" inputmode="decimal" [(ngModel)]="e.horas"></ion-input></ion-item>
              }
              <ion-item><ion-textarea label="Notas" labelPlacement="stacked" [autoGrow]="true" [(ngModel)]="e.notas"></ion-textarea></ion-item>
            </ion-list>
            @if (e.estado === 'en_stock' && e.titulo) {
              <ion-button expand="block" fill="outline" [disabled]="redactando()" (click)="redactar(e)">
                @if (redactando()) { <ion-spinner name="dots"></ion-spinner>&nbsp;Redactando… } @else { Redactar anuncio de venta }
              </ion-button>
              @if (errorAnuncio()) { <ion-note class="ayuda error">{{ errorAnuncio() }}</ion-note> }
              @if (e.anuncio; as an) {
                <div class="anuncio">
                  <div class="fila"><h3>Título</h3><ion-button size="small" fill="clear" (click)="copiar(an.titulo)">Copiar</ion-button></div>
                  <p>{{ an.titulo }}</p>
                  <div class="fila"><h3>Descripción</h3><ion-button size="small" fill="clear" (click)="copiar(an.descripcion)">Copiar</ion-button></div>
                  <p class="descripcion">{{ an.descripcion }}</p>
                  <h3>Precio</h3>
                  <p>Salida: <strong>{{ an.precio_salida_eur | number: '1.0-0' }} €</strong> · mínimo aceptable: <strong>{{ an.precio_minimo_eur | number: '1.0-0' }} €</strong></p>
                  <h3>Dónde venderlo</h3>
                  <p>{{ an.canal }}</p>
                  @if (an.palabras_clave.length) {
                    <h3>Palabras clave</h3>
                    <p>{{ an.palabras_clave.join(', ') }}</p>
                  }
                  @if (an.consejos_fotos.length) {
                    <h3>Fotos</h3>
                    <ul>@for (c of an.consejos_fotos; track $index) { <li>{{ c }}</li> }</ul>
                  }
                  <ion-button expand="block" (click)="copiar(an.titulo + '\n\n' + an.descripcion)">Copiar título y descripción</ion-button>
                  @if (copiado()) { <ion-note class="ayuda">{{ copiado() }}</ion-note> }
                </div>
              }
            }
            @if (existe(e.id)) {
              <ion-button expand="block" fill="clear" color="danger" (click)="borrar(e.id)">Borrar de la cartera</ion-button>
            }
            <ion-note class="ayuda">El beneficio real y los euros por hora se calculan con lo vendido.</ion-note>
          </ion-content>
        }
      </ng-template>
    </ion-modal>
  `,
  styles: `
    .resumen { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 640px; margin: 0 auto 12px; }
    .resumen div { display: flex; flex-direction: column; padding: 10px 12px; border-radius: 10px; background: var(--ion-color-light); }
    .resumen span { font-size: 0.8rem; color: var(--ion-color-medium); }
    .resumen strong { font-size: 1.1rem; }
    .negativo { color: var(--ion-color-danger); }
    .categorias { max-width: 640px; margin: 0 auto 12px; padding: 8px 12px; border-radius: 10px; background: var(--ion-color-light); }
    .categorias summary { font-weight: 600; cursor: pointer; padding: 4px 0; }
    .categorias table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 8px; }
    .categorias th, .categorias td { text-align: right; padding: 4px 2px; border-bottom: 1px solid var(--ion-color-step-150, #ddd); }
    .categorias th:first-child, .categorias td:first-child { text-align: left; }
    .nota-tabla { font-size: 0.75rem; color: var(--ion-color-medium); margin: 6px 0 0; }
    .aviso-parado { max-width: 640px; margin: 0 auto 12px; padding: 10px 12px; border-radius: 10px;
      background: rgba(var(--ion-color-warning-rgb), 0.15); font-size: 0.9rem; }
    .texto-aviso { color: var(--ion-color-warning-shade) !important; }
    .anuncio { margin: 12px 0; padding: 12px; border-radius: 10px; background: var(--ion-color-light); }
    .anuncio h3 { margin: 12px 0 2px; font-size: 0.9rem; font-weight: 600; }
    .anuncio .fila { display: flex; align-items: center; justify-content: space-between; }
    .anuncio .fila h3 { margin: 8px 0 0; }
    .anuncio .descripcion { white-space: pre-line; }
    .error { color: var(--ion-color-danger); }
    .acciones { display: flex; gap: 8px; max-width: 640px; margin: 0 auto 12px; }
    .acciones ion-button { flex: 1; }
    ion-segment, ion-list { max-width: 640px; margin-inline: auto; }
    .vacio { text-align: center; color: var(--ion-color-medium); margin-top: 24px; padding-inline: 16px; }
    .ayuda { display: block; margin-top: 12px; text-align: center; }
  `,
})
export class CarteraComponent {
  protected readonly cartera = inject(CarteraService);
  private readonly gemini = inject(GeminiService);
  protected readonly diasParado = 60;
  protected readonly redactando = signal(false);
  protected readonly errorAnuncio = signal<string | null>(null);
  protected readonly copiado = signal<string | null>(null);

  /** Artículos para revender que llevan demasiado tiempo en stock. */
  protected readonly parados = computed(() =>
    this.cartera.enStock().filter((a) => a.estrategia === 'revender' && this.dias(a) > this.diasParado),
  );

  protected dias(a: ArticuloCartera): number {
    return Math.max(0, Math.floor((Date.now() - Date.parse(a.fechaCompra)) / 864e5));
  }

  /** Redacta el anuncio con Gemini y lo guarda en el artículo. */
  protected async redactar(e: ArticuloCartera): Promise<void> {
    this.redactando.set(true);
    this.errorAnuncio.set(null);
    this.copiado.set(null);
    try {
      const anuncio: AnuncioVenta = await this.gemini.redactarAnuncio(e);
      const actualizado = { ...e, anuncio };
      this.editando.set(actualizado);
      if (this.existe(e.id)) this.cartera.guardarArticulo({ ...(this.cartera.articulos().find((x) => x.id === e.id)!), anuncio });
    } catch (err) {
      this.errorAnuncio.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.redactando.set(false);
    }
  }

  protected async copiar(texto: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      this.copiado.set('Copiado. Pégalo en la app donde vayas a publicarlo.');
    } catch {
      this.copiado.set('No se pudo copiar automáticamente: mantén pulsado el texto para copiarlo.');
    }
  }
  protected readonly filtro = signal<Filtro>('stock');
  /** Copia editable del artículo abierto en el modal. */
  protected readonly editando = signal<ArticuloCartera | null>(null);

  protected readonly filtrados = computed(() => {
    const todos = this.cartera.articulos();
    switch (this.filtro()) {
      case 'stock': return todos.filter((a) => a.estado === 'en_stock');
      case 'guardar': return todos.filter((a) => a.estado === 'en_stock' && a.estrategia === 'guardar');
      case 'vendido': return todos.filter((a) => a.estado === 'vendido');
      default: return todos;
    }
  });

  abrir(articulo: ArticuloCartera): void {
    this.errorAnuncio.set(null);
    this.copiado.set(null);
    this.editando.set({ ...articulo });
  }

  protected existe(id: string): boolean {
    return this.cartera.articulos().some((a) => a.id === id);
  }

  protected guardar(e: ArticuloCartera): void {
    const vendido = e.estado === 'vendido';
    this.cartera.guardarArticulo({
      ...e,
      costeTotal: numero(e.costeTotal) ?? 0,
      valorEstimado: numero(e.valorEstimado),
      precioVenta: vendido ? numero(e.precioVenta) : null,
      horas: vendido ? numero(e.horas) : null,
      fechaVenta: vendido ? e.fechaVenta || new Date().toISOString().slice(0, 10) : null,
    });
    this.editando.set(null);
  }

  protected borrar(id: string): void {
    this.cartera.borrar(id);
    this.editando.set(null);
  }

  protected async exportar(): Promise<void> {
    await exportarTexto(`cartera-chollos-${new Date().toISOString().slice(0, 10)}.csv`, this.cartera.csv());
  }
}

/** Los campos de texto pueden traer "12,5" o "": lo convertimos a número o null. */
function numero(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
