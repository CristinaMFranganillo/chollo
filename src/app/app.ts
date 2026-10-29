import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { App as CapApp } from '@capacitor/app';
import {
  IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
  IonTextarea, IonList, IonLabel, IonBadge, IonSpinner, IonModal, IonToggle, IonSegment,
  IonSegmentButton, IonNote, IonThumbnail, IonListHeader, AlertController, IonSelect, IonSelectOption,
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
import { Ajustes, Aviso, Evaluacion, NOMBRE_PLATAFORMA, Plataforma, RegistroEvaluacion } from './models';
import { miniatura } from './imagenes';
import { colorNota } from './colores';
import { ResultadoComponent } from './resultado.component';
import { CarteraComponent } from './cartera.component';
import { CarteraService } from './cartera.service';
import { AprendizajesService } from './aprendizajes.service';
import { Vigilante, vigilanteDisponible } from './vigilante';
import { escucharCompartir } from './compartir';
import { abrirEnlace, buscarEn, BUSQUEDAS_RECOMENDADAS } from './enlaces';
import { exportarTexto } from './exportar';

type Vista = 'evaluar' | 'cola' | 'avisos' | 'cartera' | 'historial';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule, DecimalPipe, DatePipe, ResultadoComponent, CarteraComponent,
    IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput,
    IonTextarea, IonList, IonLabel, IonBadge, IonSpinner, IonModal, IonToggle, IonSegment,
    IonSegmentButton, IonNote, IonThumbnail, IonListHeader, IonSelect, IonSelectOption,
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
  protected readonly aprendizajes = inject(AprendizajesService);
  private readonly alertas = inject(AlertController);
  protected readonly color = colorNota;

  protected readonly vista = signal<Vista>('evaluar');

  // Formulario del anuncio actual
  protected texto = '';
  protected precio: number | string | null = null;
  /** Plataforma y forma de entrega: cambian comisiones y envío. Se recuerda la última usada. */
  protected plataforma: Plataforma = leerPlataforma();
  protected precioTotal: number | string | null = null;
  protected readonly nombrePlataforma = NOMBRE_PLATAFORMA;
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
  protected readonly mensajeCopia = signal<string | null>(null);

  // Búsquedas recomendadas
  protected readonly busquedas = BUSQUEDAS_RECOMENDADAS;
  protected readonly buscarEn = buscarEn;
  protected readonly abrir = abrirEnlace;
  protected borrador: Ajustes = { ...this.ajustesSrv.ajustes() };

  constructor() {
    addIcons({
      settingsOutline, imagesOutline, closeCircle, sparklesOutline, trashOutline, addCircleOutline,
      playOutline, notificationsOutline, alertCircleOutline, checkmarkCircleOutline,
    });
    if (!this.bienvenidaVista()) {
      this.bienvenida.set(true);
    } else {
      this.abrirAjustesSiFaltaClave();
    }
  }

  // ---------- Bienvenida (primera vez) ----------

  protected readonly bienvenida = signal(false);
  protected readonly pasoBienvenida = signal(0);
  protected readonly pasos = [
    {
      titulo: 'Encuentra chollos de segunda mano',
      texto: 'Chollos evalúa anuncios de Vinted, Wallapop o todocoleccion con IA: te dice si es un chollo, cuánto podrías ganar, los riesgos y qué preguntar al vendedor.',
    },
    {
      titulo: '1. Evalúa',
      texto: 'Haz capturas del anuncio (fotos y descripción) y súbelas en Evaluar, o compártelas con Chollos desde la galería. Si tienes varios, mándalos a la Cola y evalúalos de una vez.',
    },
    {
      titulo: '2. Recibe avisos',
      texto: 'En Avisos tienes búsquedas recomendadas para guardar en Vinted y Wallapop. En Android, Chollos lee sus notificaciones y solo te avisa de lo que parece un buen negocio.',
    },
    {
      titulo: '3. Compra, vende y mide',
      texto: 'Pulsa "Lo he comprado" para llevarlo a la Cartera. Allí redactas el anuncio de venta y ves el beneficio real, los euros por hora y qué categoría te compensa más.',
    },
    {
      titulo: 'Antes de empezar',
      texto: 'Necesitas una clave gratuita de Gemini (aistudio.google.com/apikey, con tu cuenta personal de Google). Si aún no la tienes, activa el modo demostración en Ajustes para probarlo todo.',
    },
  ];

  private bienvenidaVista(): boolean {
    try {
      return localStorage.getItem('chollos.bienvenida') === '1';
    } catch {
      return true;
    }
  }

  protected siguientePaso(): void {
    if (this.pasoBienvenida() < this.pasos.length - 1) {
      this.pasoBienvenida.update((p) => p + 1);
      return;
    }
    this.cerrarBienvenida();
  }

  protected cerrarBienvenida(): void {
    try {
      localStorage.setItem('chollos.bienvenida', '1');
    } catch {
      /* sin almacenamiento: se volverá a mostrar */
    }
    this.bienvenida.set(false);
    this.abrirAjustesSiFaltaClave();
  }

  private abrirAjustesSiFaltaClave(): void {
    const a = this.ajustesSrv.ajustes();
    if (!a.apiKey && !a.demo) this.abrirAjustes();
  }

  async ngOnInit(): Promise<void> {
    // Lo que se comparte con la app desde Vinted, Wallapop o la galería llega al formulario.
    await escucharCompartir((c) =>
      this.zone.run(() => {
        if (c.texto) this.texto = this.texto ? `${this.texto}\n${c.texto}` : c.texto;
        if (/wallapop/i.test(c.texto)) this.plataforma = 'wallapop_envio';
        else if (/vinted/i.test(c.texto)) this.plataforma = 'vinted';
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
  private totalNumero(): number | null {
    if (this.precioTotal === null || String(this.precioTotal).trim() === '') return null;
    const n = Number(String(this.precioTotal).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  protected cambiarPlataforma(p: Plataforma): void {
    this.plataforma = p;
    try {
      localStorage.setItem('chollos.plataforma', p);
    } catch {
      /* sin almacenamiento */
    }
  }

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
      const evaluacion = await this.gemini.evaluar(this.texto.trim(), precio, archivos, this.plataforma, this.totalNumero());
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
    await this.cola.anadir(
      this.texto.trim(), this.precioNumero(), this.fotos().map((f) => f.archivo), this.plataforma, this.totalNumero(),
    );
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
    this.precioTotal = null;
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
    if (a.app === 'Wallapop') this.plataforma = 'wallapop_envio';
    else if (a.app === 'Vinted') this.plataforma = 'vinted';
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

  // ---------- Aprendizajes ----------

  /** "Corregir valoración": lo que la IA hizo mal se guarda y se tiene en cuenta en las siguientes. */
  protected async corregir(evaluacion: Evaluacion, titulo: string): Promise<void> {
    const alerta = await this.alertas.create({
      header: 'Enseñar a la app',
      message: '¿Qué estaba mal o qué sabes tú de esto? Por ejemplo: "no era plata, era alpaca Meneses" o "este modelo se vende a 40 € en todocoleccion".',
      inputs: [{ name: 'texto', type: 'textarea', placeholder: 'Tu corrección' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (datos: { texto: string }) => {
            if (!datos.texto?.trim()) return;
            this.aprendizajes.anadir(evaluacion.categoria, `Corrección sobre «${titulo || evaluacion.categoria}»: ${datos.texto.trim()}`, 'correccion');
            this.aviso.set('Guardado. La app lo tendrá en cuenta en las próximas evaluaciones.');
          },
        },
      ],
    });
    await alerta.present();
  }

  protected async anadirNota(): Promise<void> {
    const alerta = await this.alertas.create({
      header: 'Añadir conocimiento',
      message: 'Algo que quieras que la app sepa siempre (marcas, precios, canales, trucos).',
      inputs: [
        { name: 'categoria', type: 'text', placeholder: 'Categoría (p. ej. Cuberterías)' },
        { name: 'texto', type: 'textarea', placeholder: 'Lo que debe saber' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', handler: (d: { categoria: string; texto: string }) => this.aprendizajes.anadir(d.categoria, d.texto, 'manual') },
      ],
    });
    await alerta.present();
  }

  // ---------- Historial y ajustes ----------

  protected verRegistro(h: RegistroEvaluacion): void {
    this.nuevo();
    this.resultado.set(h.evaluacion);
    this.metaResultado.set({ titulo: h.titulo, miniatura: h.miniatura, precio: h.precio });
    this.vista.set('evaluar');
  }

  /** Copia de seguridad: cartera, historial y ajustes (sin la clave de la API). */
  protected async exportarCopia(): Promise<void> {
    const { apiKey: _sinClave, ...ajustes } = this.ajustesSrv.ajustes();
    const copia = {
      app: 'chollos',
      version: 1,
      fecha: new Date().toISOString(),
      ajustes,
      cartera: this.cartera.articulos(),
      historial: this.historial.registros(),
      aprendizajes: this.aprendizajes.lista(),
    };
    await exportarTexto(`chollos-copia-${copia.fecha.slice(0, 10)}.json`, JSON.stringify(copia), 'application/json');
    this.mensajeCopia.set('Copia exportada.');
  }

  protected async importarCopia(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    try {
      const copia = JSON.parse(await archivo.text());
      if (copia?.app !== 'chollos' || !Array.isArray(copia.cartera) || !Array.isArray(copia.historial)) {
        throw new Error('El archivo no es una copia de Chollos.');
      }
      const ok = confirm(
        `Esta copia tiene ${copia.cartera.length} artículos en cartera y ${copia.historial.length} evaluaciones. ` +
          'Sustituirá los datos actuales. ¿Continuar?',
      );
      if (!ok) return;
      this.cartera.reemplazar(copia.cartera);
      this.historial.reemplazar(copia.historial);
      if (Array.isArray(copia.aprendizajes)) this.aprendizajes.reemplazar(copia.aprendizajes);
      if (copia.ajustes) {
        this.borrador = { ...this.borrador, ...copia.ajustes, apiKey: this.borrador.apiKey };
      }
      this.mensajeCopia.set('Copia importada correctamente.');
    } catch (e) {
      this.mensajeCopia.set(e instanceof Error ? e.message : String(e));
    }
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
    this.mensajeCopia.set(null);
    this.borrador = { ...this.ajustesSrv.ajustes() };
    this.ajustesAbiertos.set(true);
  }

  protected async guardarAjustes(): Promise<void> {
    this.ajustesSrv.guardar({ ...this.borrador, apiKey: this.borrador.apiKey.trim() });
    this.ajustesAbiertos.set(false);
    await this.sincronizarVigilante();
  }
}

function leerPlataforma(): Plataforma {
  try {
    const p = localStorage.getItem('chollos.plataforma') as Plataforma | null;
    return p && p in NOMBRE_PLATAFORMA ? p : 'vinted';
  } catch {
    return 'vinted';
  }
}
