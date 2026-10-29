import { Injectable, computed, signal } from '@angular/core';
import { Aprendizaje, ArticuloCartera } from './models';
import { guardar, leer } from './almacen';

const CLAVE = 'chollos.aprendizajes';
/** Límite de lo que se manda a Gemini en cada evaluación, para no disparar el tamaño de la petición. */
const MAX_EN_CONTEXTO = 40;

/**
 * Memoria de aprendizajes: lo que sabes tú y no sabe ninguna IA. Correcciones a valoraciones,
 * precios a los que de verdad has vendido y notas propias. Se añade a las instrucciones de Gemini
 * para que sus valoraciones se ajusten a tu mercado y tus canales.
 */
@Injectable({ providedIn: 'root' })
export class AprendizajesService {
  readonly lista = signal<Aprendizaje[]>([]);
  readonly total = computed(() => this.lista().length);

  constructor() {
    leer<Aprendizaje[]>(CLAVE, []).then((l) => this.lista.update((a) => [...a, ...l]));
  }

  anadir(categoria: string, texto: string, origen: Aprendizaje['origen'], id: string = crypto.randomUUID()): void {
    const limpio = texto.trim();
    if (!limpio) return;
    const nuevo: Aprendizaje = { id, fecha: new Date().toISOString().slice(0, 10), categoria: categoria.trim() || 'General', texto: limpio, origen };
    // Si ya existe (p. ej. la venta de un mismo artículo editada), se sustituye.
    this.actualizar([nuevo, ...this.lista().filter((a) => a.id !== id)]);
  }

  borrar(id: string): void {
    this.actualizar(this.lista().filter((a) => a.id !== id));
  }

  reemplazar(lista: Aprendizaje[]): void {
    this.actualizar(lista);
  }

  /** Registra automáticamente una venta real (precio, canal y días) como aprendizaje. */
  registrarVenta(a: ArticuloCartera): void {
    if (a.estado !== 'vendido' || a.precioVenta == null) return;
    const dias = a.fechaVenta ? Math.round((Date.parse(a.fechaVenta) - Date.parse(a.fechaCompra)) / 864e5) : null;
    const texto =
      `Venta real: «${a.titulo}» comprado por ${a.costeTotal} € y vendido por ${a.precioVenta} € netos` +
      (a.canalVenta ? ` en ${a.canalVenta}` : '') +
      (dias != null ? ` en ${dias} días` : '') +
      (a.valorEstimado != null ? ` (se había estimado ${a.valorEstimado} €)` : '') +
      '.';
    this.anadir(a.categoria, texto, 'venta', `venta-${a.id}`);
  }

  /** Texto para las instrucciones de Gemini (vacío si no hay aprendizajes). */
  contexto(): string {
    const recientes = this.lista().slice(0, MAX_EN_CONTEXTO);
    if (!recientes.length) return '';
    const lineas = recientes.map((a) => `- [${a.categoria}] ${a.texto}`).join('\n');
    return `

## Aprendizajes de esta usuaria (prioridad alta)

Son correcciones a valoraciones anteriores, ventas reales y notas suyas. Tenlos en cuenta por encima
de tu conocimiento general cuando afecten al anuncio: ajusta identificación, precios y canal en
consecuencia, y menciónalo en "motivo" si un aprendizaje cambia tu valoración.

${lineas}`;
  }

  private actualizar(lista: Aprendizaje[]): void {
    this.lista.set(lista);
    void guardar(CLAVE, lista);
  }
}
