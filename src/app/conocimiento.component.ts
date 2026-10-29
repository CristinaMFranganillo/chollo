import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonSearchbar, IonSegment,
  IonSegmentButton, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline, close, createOutline, trashOutline, chevronDown, chevronUp } from 'ionicons/icons';
import { AprendizajesService } from './aprendizajes.service';
import { ANEXOS, CATEGORIAS } from './conocimiento';
import { markdownAHtml } from './markdown';
import { Aprendizaje } from './models';
import { IlustracionComponent } from './ilustracion.component';

type Pestana = 'tuyo' | 'guias';

const ORIGEN: Record<Aprendizaje['origen'], string> = {
  manual: 'Nota',
  correccion: 'Corrección',
  venta: 'Venta real',
};

/**
 * Pantalla "Conocimiento": lo que la app sabe de tu mercado (tus notas, correcciones y ventas)
 * y las guías expertas que usa para valorar. Va dentro de un modal de app.html.
 */
@Component({
  selector: 'app-conocimiento',
  host: { class: 'ion-page' },
  imports: [
    FormsModule, IlustracionComponent,
    IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonSearchbar, IonSegment,
    IonSegmentButton, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar,
  ],
  template: `
    <ion-header class="cabecera">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" class="boton-icono" (click)="cerrar.emit()" aria-label="Cerrar">
            <ion-icon aria-hidden="true" slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Conocimiento</ion-title>
      </ion-toolbar>
      <ion-toolbar class="barra-pestanas">
        <ion-segment [value]="pestana()" (ionChange)="pestana.set($any($event.detail.value))">
          <ion-segment-button value="tuyo"><ion-label>Lo que sabe de ti ({{ ap.total() }})</ion-label></ion-segment-button>
          <ion-segment-button value="guias"><ion-label>Guías expertas</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (pestana() === 'tuyo') {
        <p class="intro">
          Tus notas, correcciones y ventas reales. Gemini las lee antes de valorar y les da prioridad sobre lo que sabe en general.
          Las <strong>fijadas</strong> se envían siempre; el resto, las que tienen que ver con el anuncio.
        </p>

        <section class="nueva" aria-labelledby="titulo-nueva">
          <h2 id="titulo-nueva">Enseñar algo nuevo</h2>
          <ion-list lines="none" class="formulario">
            <ion-item>
              <ion-select label="Categoría" labelPlacement="stacked" interface="popover" [(ngModel)]="categoria">
                @for (c of categorias; track c) { <ion-select-option [value]="c">{{ c }}</ion-select-option> }
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-textarea label="Lo que debe saber" labelPlacement="stacked" [autoGrow]="true" rows="3"
                placeholder="Ej.: En mi zona las vajillas Pickman completas se venden a 150 € en Wallapop, en mano."
                [(ngModel)]="texto"></ion-textarea>
            </ion-item>
          </ion-list>
          <ion-button expand="block" [disabled]="!texto.trim()" (click)="anadir()">Guardar conocimiento</ion-button>
        </section>

        @if (ap.total()) {
          <ion-searchbar placeholder="Buscar en lo que sabe" [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event ?? '')" [debounce]="150"
            aria-label="Buscar en lo que sabe"></ion-searchbar>
          <div class="filtros" role="group" aria-label="Filtrar por categoría">
            <button type="button" class="chip" [class.activo]="!filtro()" [attr.aria-pressed]="!filtro()" (click)="filtro.set(null)">Todas</button>
            @for (c of categoriasUsadas(); track c) {
              <button type="button" class="chip" [class.activo]="filtro() === c" [attr.aria-pressed]="filtro() === c" (click)="filtro.set(c)">{{ c }}</button>
            }
          </div>

          @for (a of visibles(); track a.id) {
            <article class="nota" [class.fijada]="a.fijado">
              <header>
                <span class="origen" [class.correccion]="a.origen === 'correccion'" [class.venta]="a.origen === 'venta'">{{ origen[a.origen] }}</span>
                <span class="categoria">{{ a.categoria }} · {{ a.fecha }}</span>
                <button type="button" class="icono" (click)="ap.alternarFijado(a.id)" [attr.aria-pressed]="!!a.fijado"
                  [attr.aria-label]="a.fijado ? 'Dejar de fijar' : 'Fijar: enviar siempre'">
                  <ion-icon aria-hidden="true" [name]="a.fijado ? 'bookmark' : 'bookmark-outline'"></ion-icon>
                </button>
              </header>
              @if (editando() === a.id) {
                <ion-list lines="none" class="formulario">
                  <ion-item>
                    <ion-select label="Categoría" labelPlacement="stacked" interface="popover" [(ngModel)]="categoriaEdicion">
                      @for (c of categoriasConActual(a.categoria); track c) { <ion-select-option [value]="c">{{ c }}</ion-select-option> }
                    </ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-textarea label="Texto" labelPlacement="stacked" [autoGrow]="true" [(ngModel)]="textoEdicion"></ion-textarea>
                  </ion-item>
                </ion-list>
                <div class="acciones-nota">
                  <ion-button size="small" (click)="guardarEdicion(a.id)">Guardar</ion-button>
                  <ion-button size="small" fill="clear" (click)="editando.set(null)">Cancelar</ion-button>
                </div>
              } @else {
                <p>{{ a.texto }}</p>
                <div class="acciones-nota">
                  <ion-button size="small" fill="clear" (click)="editar(a)">
                    <ion-icon aria-hidden="true" slot="start" name="create-outline"></ion-icon> Editar
                  </ion-button>
                  <ion-button size="small" fill="clear" color="medium" (click)="ap.borrar(a.id)" [attr.aria-label]="'Borrar: ' + a.texto">
                    <ion-icon aria-hidden="true" slot="start" name="trash-outline"></ion-icon> Borrar
                  </ion-button>
                </div>
              }
            </article>
          } @empty {
            <p class="sin-resultados">Nada coincide con la búsqueda.</p>
          }
        } @else {
          <div class="vacio">
            <app-ilustracion nombre="clave" />
            <h2>Aún no le has enseñado nada</h2>
            <p>Añade lo que sabes de tu mercado. También se guardan solas tus correcciones («¿Algo no cuadra?») y tus ventas reales de la Cartera.</p>
          </div>
        }
      } @else {
        <p class="intro">
          Lo que la app sabe por defecto. Para no gastar de más, a Gemini solo se le envía la guía del tema del anuncio
          (o todas si no lo reconoce).
        </p>
        @for (g of guias; track g.letra) {
          <article class="guia">
            <button type="button" class="guia-cabecera" (click)="alternarGuia(g.letra)" [attr.aria-expanded]="abierta() === g.letra"
              [attr.aria-controls]="'guia-' + g.letra">
              <span class="letra" aria-hidden="true">{{ g.letra }}</span>
              <span class="guia-textos">
                <strong>{{ g.titulo }}</strong>
                <small>Se usa con: {{ g.cuando }}</small>
              </span>
              <ion-icon aria-hidden="true" [name]="abierta() === g.letra ? 'chevron-up' : 'chevron-down'"></ion-icon>
            </button>
            @if (abierta() === g.letra) {
              <div class="guia-texto" [id]="'guia-' + g.letra" [innerHTML]="g.html"></div>
            }
          </article>
        }
      }
    </ion-content>
  `,
  styles: `
    .barra-pestanas { --padding-start: 12px; --padding-end: 12px; --padding-bottom: 8px; }
    .intro { margin: 0 auto 14px; max-width: 640px; color: var(--tinta-suave); font-size: 0.9rem; line-height: 1.5; }
    .nueva, .nota, .guia, ion-searchbar, .filtros, .vacio, .sin-resultados { max-width: 640px; margin-inline: auto; }
    .nueva {
      margin-bottom: 18px; padding: 16px; border-radius: var(--radio); border: 1px solid var(--cristal-borde);
      background: var(--cristal); box-shadow: var(--sombra);
    }
    .nueva h2 { margin: 0 0 12px; font-size: 1.05rem; font-weight: 800; }
    ion-searchbar { --border-radius: 14px; --background: var(--campo); --box-shadow: none; padding: 0; margin-bottom: 8px; }
    .filtros { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px; }
    .chip {
      flex: none; min-height: 32px; padding: 0 12px; border-radius: 999px; cursor: pointer; font: inherit; font-size: 0.8rem; font-weight: 700;
      border: 1px solid transparent; background: var(--campo); color: var(--tinta-suave);
    }
    .chip.activo { background: var(--marca-petroleo-suave); color: var(--ion-color-primary); border-color: rgba(var(--ion-color-primary-rgb), 0.35); }
    .chip:focus-visible, .icono:focus-visible, .guia-cabecera:focus-visible { outline: 2px solid var(--ion-color-primary); outline-offset: 2px; }
    .nota {
      margin-bottom: 10px; padding: 12px 14px 6px; border-radius: var(--radio-sm); border: 1px solid var(--cristal-borde); background: var(--cristal);
    }
    .nota.fijada { border-color: rgba(var(--ion-color-primary-rgb), 0.45); box-shadow: inset 4px 0 0 var(--ion-color-primary); }
    .nota header { display: flex; align-items: center; gap: 8px; }
    .nota p { margin: 8px 0 4px; line-height: 1.5; }
    .origen { padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; background: var(--campo); color: var(--tinta-suave); }
    .origen.correccion { background: var(--marca-coral-suave); color: var(--ion-color-secondary); }
    .origen.venta { background: rgba(var(--ion-color-success-rgb), 0.14); color: var(--ion-color-success); }
    .categoria { flex: 1; font-size: 0.78rem; font-weight: 600; color: var(--tinta-suave); }
    .icono {
      display: grid; place-items: center; width: 40px; height: 40px; margin: -6px -8px -6px 0; border: 0; border-radius: 12px;
      background: none; color: var(--ion-color-primary); font-size: 20px; cursor: pointer;
    }
    .acciones-nota { display: flex; gap: 4px; margin: 0 -8px; }
    .acciones-nota ion-button { min-height: 36px; margin: 0; }
    .sin-resultados { text-align: center; color: var(--tinta-suave); }
    .vacio { padding: 8px 16px 24px; text-align: center; }
    .vacio app-ilustracion { max-width: 180px; }
    .vacio h2 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 800; }
    .vacio p { margin: 0 auto; max-width: 340px; color: var(--tinta-suave); line-height: 1.5; }
    .guia {
      margin-bottom: 10px; border-radius: var(--radio-sm); border: 1px solid var(--cristal-borde); background: var(--cristal); overflow: hidden;
    }
    .guia-cabecera {
      display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px; border: 0; background: none;
      color: var(--tinta); font: inherit; text-align: left; cursor: pointer;
    }
    .guia-cabecera ion-icon { flex: none; font-size: 20px; color: var(--tinta-suave); }
    .letra {
      flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px;
      background: var(--marca-petroleo-suave); color: var(--ion-color-primary); font-weight: 800;
    }
    .guia-textos { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .guia-textos strong { font-size: 0.98rem; }
    .guia-textos small { font-size: 0.78rem; color: var(--tinta-suave); }
    .guia-texto { padding: 0 16px 16px; font-size: 0.9rem; line-height: 1.55; }
    /* El texto de la guía llega por innerHTML: necesita ::ng-deep para que le lleguen los estilos. */
    .guia-texto ::ng-deep :is(h3, h4) { margin: 18px 0 6px; font-size: 0.95rem; font-weight: 800; line-height: 1.35; }
    .guia-texto ::ng-deep p { margin: 6px 0; }
    .guia-texto ::ng-deep :is(ul, ol) { margin: 6px 0; padding-left: 20px; }
    .guia-texto ::ng-deep li { margin-bottom: 4px; }
    .guia-texto ::ng-deep .tabla { overflow-x: auto; margin: 8px 0; border-radius: 12px; border: 1px solid rgba(var(--ion-text-color-rgb), 0.1); }
    .guia-texto ::ng-deep table { border-collapse: collapse; font-size: 0.8rem; min-width: 100%; }
    .guia-texto ::ng-deep :is(th, td) { padding: 7px 9px; text-align: left; vertical-align: top; border-bottom: 1px solid rgba(var(--ion-text-color-rgb), 0.08); }
    .guia-texto ::ng-deep th { font-weight: 800; background: var(--campo); }
    .guia-texto ::ng-deep tr:last-child td { border-bottom: 0; }
  `,
})
export class ConocimientoComponent {
  protected readonly ap = inject(AprendizajesService);
  readonly cerrar = output<void>();

  protected readonly pestana = signal<Pestana>('tuyo');
  protected readonly categorias = CATEGORIAS;
  protected readonly origen = ORIGEN;
  protected categoria = 'General';
  protected texto = '';

  protected readonly busqueda = signal('');
  protected readonly filtro = signal<string | null>(null);
  protected readonly editando = signal<string | null>(null);
  protected categoriaEdicion = '';
  protected textoEdicion = '';

  protected readonly guias = ANEXOS.map((a) => ({ ...a, titulo: a.titulo.charAt(0).toUpperCase() + a.titulo.slice(1), html: markdownAHtml(a.texto.replace(/^## Anexo [A-Z]\..*\n/, '')) }));
  protected readonly abierta = signal<string | null>(null);

  protected readonly categoriasUsadas = computed(() => [...new Set(this.ap.lista().map((a) => a.categoria))].sort());

  protected readonly visibles = computed(() => {
    const q = this.normalizar(this.busqueda());
    const f = this.filtro();
    return this.ap
      .lista()
      .filter((a) => !f || a.categoria === f)
      .filter((a) => !q || this.normalizar(`${a.categoria} ${a.texto}`).includes(q))
      // Fijadas primero, el resto como está (lo más reciente arriba).
      .sort((a, b) => Number(!!b.fijado) - Number(!!a.fijado));
  });

  constructor() {
    addIcons({ bookmark, bookmarkOutline, close, createOutline, trashOutline, chevronDown, chevronUp });
  }

  protected anadir(): void {
    this.ap.anadir(this.categoria, this.texto, 'manual');
    this.texto = '';
  }

  protected editar(a: Aprendizaje): void {
    this.categoriaEdicion = a.categoria;
    this.textoEdicion = a.texto;
    this.editando.set(a.id);
  }

  protected guardarEdicion(id: string): void {
    this.ap.editar(id, { categoria: this.categoriaEdicion, texto: this.textoEdicion });
    this.editando.set(null);
  }

  protected categoriasConActual(actual: string): string[] {
    return CATEGORIAS.includes(actual) ? CATEGORIAS : [actual, ...CATEGORIAS];
  }

  protected alternarGuia(letra: string): void {
    this.abierta.set(this.abierta() === letra ? null : letra);
  }

  private normalizar(t: string): string {
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }
}
