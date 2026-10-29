import { Injectable, computed, signal } from '@angular/core';
import { ArticuloCartera, Evaluacion } from './models';
import { guardar, leer } from './almacen';

const CLAVE = 'chollos.cartera';

/** Tus compras: lo que tienes en stock, lo que guardas como inversión y lo que has vendido. */
@Injectable({ providedIn: 'root' })
export class CarteraService {
  readonly articulos = signal<ArticuloCartera[]>([]);

  constructor() {
    leer<ArticuloCartera[]>(CLAVE, []).then((lista) => this.articulos.update((a) => [...a, ...lista]));
  }

  readonly enStock = computed(() => this.articulos().filter((a) => a.estado === 'en_stock'));
  readonly vendidos = computed(() => this.articulos().filter((a) => a.estado === 'vendido'));

  /** Cifras para el resumen de la cartera. */
  readonly resumen = computed(() => {
    const stock = this.enStock();
    const vendidos = this.vendidos();
    const invertido = suma(stock.map((a) => a.costeTotal));
    const valorStock = suma(stock.map((a) => a.valorEstimado ?? a.costeTotal));
    const beneficio = suma(vendidos.map((a) => (a.precioVenta ?? 0) - a.costeTotal));
    const horas = suma(vendidos.map((a) => a.horas ?? 0));
    const dias = vendidos
      .filter((a) => a.fechaVenta)
      .map((a) => (Date.parse(a.fechaVenta!) - Date.parse(a.fechaCompra)) / 864e5);
    return {
      piezasStock: stock.length,
      invertido,
      valorStock,
      plusvaliaLatente: valorStock - invertido,
      piezasVendidas: vendidos.length,
      beneficio,
      porHora: horas > 0 ? beneficio / horas : null,
      diasMedios: dias.length ? suma(dias) / dias.length : null,
    };
  });

  /** Crea un artículo a partir de una evaluación ("Lo he comprado"). */
  desdeEvaluacion(e: Evaluacion, titulo: string, miniatura: string | null, precio: number | null): ArticuloCartera {
    return {
      id: crypto.randomUUID(),
      titulo: titulo || e.categoria,
      categoria: e.categoria,
      estrategia: /guard/i.test(e.revender_o_guardar) ? 'guardar' : 'revender',
      fechaCompra: hoy(),
      costeTotal: e.coste_total_eur || precio || 0,
      valorEstimado: e.ingreso_neto_eur ?? null,
      estado: 'en_stock',
      precioVenta: null,
      canalVenta: '',
      fechaVenta: null,
      horas: null,
      ubicacion: '',
      notas: e.como_venderlo ?? '',
      miniatura,
    };
  }

  nuevo(): ArticuloCartera {
    return {
      id: crypto.randomUUID(),
      titulo: '',
      categoria: '',
      estrategia: 'revender',
      fechaCompra: hoy(),
      costeTotal: 0,
      valorEstimado: null,
      estado: 'en_stock',
      precioVenta: null,
      canalVenta: '',
      fechaVenta: null,
      horas: null,
      ubicacion: '',
      notas: '',
      miniatura: null,
    };
  }

  guardarArticulo(articulo: ArticuloCartera): void {
    const lista = this.articulos();
    const existe = lista.some((a) => a.id === articulo.id);
    this.actualizar(existe ? lista.map((a) => (a.id === articulo.id ? articulo : a)) : [articulo, ...lista]);
  }

  borrar(id: string): void {
    this.actualizar(this.articulos().filter((a) => a.id !== id));
  }

  /** CSV con separador ";" para que Excel en español lo abra bien. */
  csv(): string {
    const columnas: (keyof ArticuloCartera)[] = [
      'titulo', 'categoria', 'estrategia', 'estado', 'fechaCompra', 'costeTotal', 'valorEstimado',
      'precioVenta', 'canalVenta', 'fechaVenta', 'horas', 'ubicacion', 'notas',
    ];
    const celda = (v: unknown) => {
      const t = v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : String(v);
      return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const filas = this.articulos().map((a) => columnas.map((c) => celda(a[c])).join(';'));
    return '﻿' + [columnas.join(';'), ...filas].join('\n');
  }

  private actualizar(lista: ArticuloCartera[]): void {
    this.articulos.set(lista);
    void guardar(CLAVE, lista);
  }
}

const suma = (n: number[]) => n.reduce((a, b) => a + b, 0);
const hoy = () => new Date().toISOString().slice(0, 10);
