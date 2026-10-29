import { Injectable, computed, signal } from '@angular/core';
import { Aprendizaje, ArticuloCartera } from './models';
import { guardar, leer } from './almacen';
import { temasDe } from './conocimiento';

const CLAVE = 'chollos.aprendizajes';
/** Límite de lo que se manda a Gemini en cada evaluación, para no disparar el tamaño de la petición. */
const MAX_EN_CONTEXTO = 40;
/** Para el filtro rápido de notificaciones (Android) mandamos menos y más corto. */
const MAX_EN_FILTRO = 15;

/** Palabras con contenido (5 letras o más, sin tildes) para ver si un aprendizaje habla de lo mismo que el anuncio. */
const palabras = (t: string): Set<string> =>
  new Set(
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/).filter((p) => p.length >= 5),
  );

/**
 * Memoria de aprendizajes: lo que sabes tú y no sabe ninguna IA. Correcciones a valoraciones,
 * precios a los que de verdad has vendido y notas propias. Se añade a las instrucciones de Gemini
 * para que sus valoraciones se ajusten a tu mercado y tus canales.
 */
@Injectable({ providedIn: 'root' })
export class AprendizajesService {
  readonly lista = signal<Aprendizaje[]>([]);
  readonly total = computed(() => this.lista().length);
  readonly fijados = computed(() => this.lista().filter((a) => a.fijado).length);

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

  editar(id: string, cambios: Partial<Pick<Aprendizaje, 'texto' | 'categoria'>>): void {
    const texto = cambios.texto?.trim();
    if (cambios.texto !== undefined && !texto) return;
    this.actualizar(
      this.lista().map((a) =>
        a.id === id ? { ...a, ...cambios, ...(texto ? { texto } : {}), categoria: (cambios.categoria ?? a.categoria).trim() || 'General' } : a,
      ),
    );
  }

  alternarFijado(id: string): void {
    this.actualizar(this.lista().map((a) => (a.id === id ? { ...a, fijado: !a.fijado } : a)));
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

  /**
   * Los aprendizajes que más importan para un anuncio, en orden: primero los fijados, luego los del
   * mismo tema (plata, vajillas, LEGO…), luego los que comparten palabras con el anuncio y, por último,
   * los más recientes. Sin texto de anuncio, fijados y recientes.
   */
  relevantes(textoAnuncio = '', maximo = MAX_EN_CONTEXTO): Aprendizaje[] {
    const temas = new Set(temasDe(textoAnuncio));
    const suyas = palabras(textoAnuncio);
    return this.lista()
      .map((a, orden) => {
        const contenido = `${a.categoria} ${a.texto}`;
        const mismoTema = temasDe(contenido).some((t) => temas.has(t));
        const comunes = [...palabras(contenido)].filter((p) => suyas.has(p)).length;
        const puntos = (a.fijado ? 1000 : 0) + (mismoTema ? 100 : 0) + Math.min(comunes, 5) * 10;
        return { a, puntos, orden };
      })
      .sort((x, y) => y.puntos - x.puntos || x.orden - y.orden)
      .slice(0, maximo)
      .map((x) => x.a);
  }

  /** Texto para las instrucciones de Gemini (vacío si no hay aprendizajes). */
  contexto(textoAnuncio = ''): string {
    const elegidos = this.relevantes(textoAnuncio);
    if (!elegidos.length) return '';
    const lineas = elegidos.map((a) => `- [${a.categoria}] ${a.texto}`).join('\n');
    return `

## Aprendizajes de esta usuaria (prioridad alta)

Son correcciones a valoraciones anteriores, ventas reales y notas suyas. Tenlos en cuenta por encima
de tu conocimiento general cuando afecten al anuncio: ajusta identificación, precios y canal en
consecuencia, y menciónalo en "motivo" si un aprendizaje cambia tu valoración.

${lineas}`;
  }

  /**
   * Resumen para el filtro rápido de notificaciones: fijados, notas y correcciones antes que las
   * ventas (que dicen poco de un título suelto), cortado para que la llamada siga siendo rápida.
   */
  resumenFiltro(): string {
    const peso = (a: Aprendizaje) => (a.fijado ? 0 : a.origen === 'venta' ? 2 : 1);
    return [...this.lista()]
      .map((a, orden) => ({ a, orden }))
      .sort((x, y) => peso(x.a) - peso(y.a) || x.orden - y.orden)
      .slice(0, MAX_EN_FILTRO)
      .map(({ a }) => `- [${a.categoria}] ${a.texto.length > 160 ? a.texto.slice(0, 157) + '…' : a.texto}`)
      .join('\n');
  }

  private actualizar(lista: Aprendizaje[]): void {
    this.lista.set(lista);
    void guardar(CLAVE, lista);
  }
}
