import { TestBed } from '@angular/core/testing';
import { CarteraService } from './cartera.service';
import { ArticuloCartera, Evaluacion } from './models';

function articulo(cambios: Partial<ArticuloCartera>): ArticuloCartera {
  return {
    id: crypto.randomUUID(), titulo: 'x', categoria: 'LEGO', estrategia: 'revender', fechaCompra: '2026-01-01',
    costeTotal: 10, valorEstimado: null, estado: 'en_stock', precioVenta: null, canalVenta: '', fechaVenta: null,
    horas: null, ubicacion: '', notas: '', miniatura: null, ...cambios,
  };
}

describe('CarteraService', () => {
  let cartera: CarteraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cartera = TestBed.inject(CarteraService);
    cartera.reemplazar([]);
  });

  it('calcula invertido, valor latente y beneficio real', () => {
    cartera.reemplazar([
      articulo({ costeTotal: 40, valorEstimado: 100 }),
      articulo({ costeTotal: 20, estado: 'vendido', precioVenta: 70, horas: 2, fechaCompra: '2026-01-01', fechaVenta: '2026-01-11' }),
    ]);
    const r = cartera.resumen();
    expect(r.invertido).toBe(40);
    expect(r.valorStock).toBe(100);
    expect(r.plusvaliaLatente).toBe(60);
    expect(r.beneficio).toBe(50);
    expect(r.porHora).toBe(25);
    expect(r.diasMedios).toBe(10);
  });

  it('agrupa por categoría y ordena por beneficio', () => {
    cartera.reemplazar([
      articulo({ categoria: 'LEGO', costeTotal: 10, estado: 'vendido', precioVenta: 30, horas: 1 }),
      articulo({ categoria: 'Cuberterías', costeTotal: 50, estado: 'vendido', precioVenta: 150, horas: 4 }),
      articulo({ categoria: '', costeTotal: 5 }),
    ]);
    const c = cartera.porCategoria();
    expect(c.map((x) => x.categoria)).toEqual(['Cuberterías', 'LEGO', 'Sin categoría']);
    expect(c[0].beneficio).toBe(100);
    expect(c[0].porHora).toBe(25);
    expect(c[0].rentabilidad).toBe(2);
  });

  it('exporta CSV con punto y coma y decimales con coma', () => {
    cartera.reemplazar([articulo({ titulo: 'Cubertería; plata', costeTotal: 12.5 })]);
    const lineas = cartera.csv().replace('﻿', '').split('\n');
    expect(lineas[0].startsWith('titulo;categoria')).toBeTrue();
    expect(lineas[1]).toContain('"Cubertería; plata"');
    expect(lineas[1]).toContain('12,5');
  });

  it('crea el artículo desde una evaluación y detecta "guardar"', () => {
    const e = {
      nota: 'CHOLLO', motivo: '', categoria: 'Cuberterías', multiplo: 3, coste_total_eur: 68, ingreso_neto_eur: 200,
      beneficio_neto_eur: 132, oferta_maxima_eur: null, piezas: [], revender_o_guardar: 'Guardar: plata bajo peso',
      como_venderlo: 'todocoleccion', riesgos: [], preguntas_vendedor: [],
    } as Evaluacion;
    const a = cartera.desdeEvaluacion(e, 'Cubertería', null, 60);
    expect(a.estrategia).toBe('guardar');
    expect(a.costeTotal).toBe(68);
    expect(a.valorEstimado).toBe(200);
  });
});
