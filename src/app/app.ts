import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { App as CapApp } from '@capacitor/app';
import {
  IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
  IonTextarea, IonList, IonLabel, IonBadge, IonSpinner, IonModal, IonToggle, IonSegment,
  IonSegmentButton, IonNote, IonThumbnail, IonListHeader,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline, imagesOutline, closeCircle, sparklesOutline, trashOutline, addCircleOutline,
  playOutline, notificationsOutline, alertCircleOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import { GeminiService } from './gemini.service';
import { AjustesService } from './ajustes.service';
import { HistorialService } from './historial.service';
import { ColaService } from './cola.service';
import { Ajustes, Aviso, Evaluacion, RegistroEvaluacion } from './models';
import { miniatura } from './imagenes';
import { colorNota } from './colores';
import { ResultadoComponent } from './resultado.component';
import { CarteraComponent } from './cartera.component';
import { CarteraService } from './cartera.service';
import { Vigilante, vigilanteDisponible } from './vigilante';
import { escucharCompartir } from './compartir';

type Vista = 'evaluar' | 'cola' | 'avisos' | 'cartera' | 'historial';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule, DecimalPipe, DatePipe, ResultadoComponent, CarteraComponent,
    IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
    IonTextarea, IonList, IonLabel, IonBadge, IonSpinner, IonModal, IonToggle, IonSegment,
    IonSegmentButton, IonNote, IonThumbnail, IonListHeader,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly gemini = inject(GeminiService);
  private readonly zone = inject(NgZone);
  protected readonly ajustesSrv = inject(AjustesService);
  protected readonly historial = inject(HistorialService);
  protected readonly cola = inject(ColaService);
  private readonly cartera = inject(CarteraService);
  protected readonly color = colorNota;

  protected readonly vista = signal<Vista>('evaluar');

  // Formulario del anuncio actual
  protected texto = '';
  protected precio: number | string | null = null;
  protected readonly fotos = signal<{ archivo: File; url: string }[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<Evaluacion | null>(null);
  /** Título, miniatura y precio del anuncio cuyo resultado se está viendo (para "Lo he comprado"). */
  protected readonly metaResultado = signal<{ titulo: string; miniatura: string | null; precio: number | null }>({
    titulo: '', miniatura: null, precio: null,
  });
  protected readonly aviso = signal<string | null>(null);

  // Cola: elemento abierto para ver su resultado
  protected readonly abiertoEnCola = signal<string | null>(null);

  // Vigilante de notificaciones (solo Android)
  protected readonly enAndroid = vigilanteDisponible();
  protected readonly avisos = signal<Aviso[]>([]);
  protected readonly permisoLectura = signal(false);
  protected readonly permisoAvisos = signal(false);

  // Ajustes (copia editable en el modal)
  protected readonly ajustesAbiertos = signal(false);
  protected readonly pruebaClave = signal<string | null>(null);
  protected borrador: Ajustes = { ...this.ajustesSrv.ajustes() };

  constructor() {
    addIcons({
      settingsOutline, imagesOutline, closeCircle, sparklesOutline, trashOutline, addCircleOutline,
      playOutline, notificationsOutline, alertCircleOutline, checkmarkCircleOutline,
    });
    const a = this.ajustesSrv.ajustes();
    if (!a.apiKey && !a.demo) this.ajustesAbiertos.set(true);
  }

  async ngOnInit(): Promise<void> {
    // Lo que se comparte con la app desde Vinted, Wallapop o la galería llega al formulario.
    await escucharCompartir((c) =>
      this.zone.run(() => {
        if (c.texto) this.texto = this.texto ? `${this.texto}\n${c.texto}` : c.texto;
        this.anadirArchivos(c.fotos);
        this.resultado.set(null);
        this.vista.set('evaluar');
        this.aviso.set(
          c.fotos.length
            ? `Recibidas ${c.fotos.length} capturas. Añade más o evalúa.`
            : 'Enlace recibido. Ahora comparte también las capturas del anuncio.',
        );
      }),
    );

    if (this.enAndroid) {
      await this.sincronizarVigilante();
      await this.cargarAvisos();
      await Vigilante.addListener('nuevoAviso', () => this.zone.run(() => this.cargarAvisos()));
      await Vigilante.addListener('avisoAbierto', () => this.zone.run(() => this.vista.set('avisos')));
      const { id } = await Vigilante.avisoPendiente();
      if (id) this.vista.set('avisos');
      // Al volver a la app (por ejemplo, tras dar el permiso), refrescamos el estado.
      await CapApp.addListener('resume', () =>
        this.zone.run(async () => {
          await this.cargarAvisos();
          await this.leerEstadoVigilante();
        }),
      );
    }
  }

  // ---------- Formulario ----------

  protected puedeEvaluar(): boolean {
    return !this.cargando() && (this.fotos().length > 0 || this.texto.trim().length > 0);
  }

  protected anadirFotos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.anadirArchivos(Array.from(input.files ?? []));
    input.value = '';
  }

  private anadirArchivos(archivos: File[]): void {
    const nuevas = archivos.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }));
    this.fotos.update((f) => [...f, ...nuevas].slice(0, 8));
  }

  protected quitarFoto(i: number): void {
    URL.revokeObjectURL(this.fotos()[i].url);
    this.fotos.update((f) => f.filter((_, j) => j !== i));
  }

  /** ion-input puede devolver el número como texto: lo normalizamos. */
  private precioNumero(): number | null {
    if (this.precio === null || String(this.precio).trim() === '') return null;
    const n = Number(String(this.precio).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  protected async evaluar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    this.resultado.set(null);
    try {
      const archivos = this.fotos().map((f) => f.archivo);
      const precio = this.precioNumero();
      const evaluacion = await this.gemini.evaluar(this.texto.trim(), precio, archivos);
      const titulo = this.texto.trim().split('\n')[0].slice(0, 60) || evaluacion.categoria;
      const mini = archivos[0] ? await miniatura(archivos[0]) : null;
      this.resultado.set(evaluacion);
      this.metaResultado.set({ titulo, miniatura: mini, precio });
      this.historial.anadir({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        titulo,
        precio,
        miniatura: mini,
        evaluacion,
      });
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.cargando.set(false);
    }
  }

  protected async anadirACola(): Promise<void> {
    await this.cola.anadir(this.texto.trim(), this.precioNumero(), this.fotos().map((f) => f.archivo));
    this.limpiarFormulario();
    this.aviso.set(`Añadido a la cola (${this.cola.pendientes()} pendientes). Puedes preparar el siguiente.`);
  }

  protected nuevo(): void {
    this.limpiarFormulario();
    this.resultado.set(null);
    this.error.set(null);
    this.aviso.set(null);
  }

  private limpiarFormulario(): void {
    this.fotos().forEach((f) => URL.revokeObjectURL(f.url));
    this.fotos.set([]);
    this.texto = '';
    this.precio = null;
  }

  // ---------- Cola ----------

  protected alternarCola(id: string): void {
    this.abiertoEnCola.update((actual) => (actual === id ? null : id));
  }

  // ---------- Avisos (vigilante) ----------

  protected async cargarAvisos(): Promise<void> {
    if (!this.enAndroid) return;
    const { avisos } = await Vigilante.obtenerAvisos();
    this.avisos.set([...avisos].sort((a, b) => b.fecha - a.fecha));
  }

  private async leerEstadoVigilante(): Promise<void> {
    const estado = await Vigilante.estado();
    this.permisoLectura.set(estado.permisoLectura);
    this.permisoAvisos.set(estado.permisoAvisos);
  }

  /** Pasa la clave y la configuración al servicio nativo, que funciona aunque la app esté cerrada. */
  private async sincronizarVigilante(): Promise<void> {
    if (!this.enAndroid) return;
    const a = this.ajustesSrv.ajustes();
    await Vigilante.configurar({ apiKey: a.apiKey, modelo: a.modeloRapido, activo: a.vigilar });
    await this.leerEstadoVigilante();
  }

  protected async darPermisoLectura(): Promise<void> {
    await Vigilante.abrirPermisoLectura();
  }

  protected async darPermisoAvisos(): Promise<void> {
    const { concedido } = await Vigilante.pedirPermisoAvisos();
    this.permisoAvisos.set(concedido);
  }

  protected async cambiarVigilancia(activo: boolean): Promise<void> {
    this.ajustesSrv.guardar({ ...this.ajustesSrv.ajustes(), vigilar: activo });
    await this.sincronizarVigilante();
  }

  protected async borrarAvisos(): Promise<void> {
    await Vigilante.borrarAvisos();
    this.avisos.set([]);
  }

  /** Lleva un aviso al formulario para evaluarlo a fondo con las capturas. */
  protected evaluarAviso(a: Aviso): void {
    this.nuevo();
    this.texto = [a.titulo, a.texto].filter(Boolean).join('\n');
    this.vista.set('evaluar');
    this.aviso.set('Abre el anuncio en Vinted, haz capturas y compártelas con Chollos para evaluarlo a fondo.');
  }

  // ---------- Cartera ----------

  /** "Lo he comprado": pasa la evaluación a la cartera y la abre para completar los datos. */
  protected loHeComprado(evaluacion: Evaluacion, titulo: string, miniaturaUrl: string | null, precio: number | null): void {
    const articulo = this.cartera.desdeEvaluacion(evaluacion, titulo, miniaturaUrl, precio);
    this.cartera.guardarArticulo(articulo);
    this.vista.set('cartera');
    this.aviso.set(null);
  }

  // ---------- Historial y ajustes ----------

  protected verRegistro(h: RegistroEvaluacion): void {
    this.nuevo();
    this.resultado.set(h.evaluacion);
    this.metaResultado.set({ titulo: h.titulo, miniatura: h.miniatura, precio: h.precio });
    this.vista.set('evaluar');
  }

  protected async probarClave(): Promise<void> {
    this.pruebaClave.set('Comprobando…');
    try {
      this.pruebaClave.set(await this.gemini.probarClave(this.borrador.apiKey));
    } catch (e) {
      this.pruebaClave.set(e instanceof Error ? e.message : String(e));
    }
  }

  protected abrirAjustes(): void {
    this.pruebaClave.set(null);
    this.borrador = { ...this.ajustesSrv.ajustes() };
    this.ajustesAbiertos.set(true);
  }

  protected async guardarAjustes(): Promise<void> {
    this.ajustesSrv.guardar({ ...this.borrador, apiKey: this.borrador.apiKey.trim() });
    this.ajustesAbiertos.set(false);
    await this.sincronizarVigilante();
  }
}
