import { TestBed } from '@angular/core/testing';
import { AprendizajesService } from './aprendizajes.service';
import { ArticuloCartera } from './models';

describe('AprendizajesService', () => {
  let ap: AprendizajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    ap = TestBed.inject(AprendizajesService);
    ap.reemplazar([]);
  });

  it('no añade nada al prompt si no hay aprendizajes', () => {
    expect(ap.contexto()).toBe('');
  });

  it('incluye correcciones en el contexto con su categoría', () => {
    ap.anadir('Cuberterías', 'Meneses sin ley es alpaca plateada', 'correccion');
    expect(ap.contexto()).toContain('[Cuberterías] Meneses sin ley es alpaca plateada');
  });

  it('registra una venta real y la sustituye si se edita', () => {
    const a: ArticuloCartera = {
      id: 'a1', titulo: 'Le Creuset 24', categoria: 'Menaje', estrategia: 'revender', fechaCompra: '2026-01-01',
      costeTotal: 45, valorEstimado: 120, estado: 'vendido', precioVenta: 110, canalVenta: 'Wallapop',
      fechaVenta: '2026-01-21', horas: 2, ubicacion: '', notas: '', miniatura: null,
    };
    ap.registrarVenta(a);
    ap.registrarVenta({ ...a, precioVenta: 115 });
    expect(ap.total()).toBe(1);
    expect(ap.lista()[0].texto).toContain('vendido por 115 € netos en Wallapop en 20 días (se había estimado 120 €)');
  });

  it('prioriza los fijados y los del mismo tema que el anuncio', () => {
    ap.anadir('LEGO', 'Los lotes al peso se venden a 10 €/kg', 'manual');
    ap.anadir('General', 'Wallapop en mano para lo que pese', 'manual');
    ap.anadir('Cuberterías', 'Meneses sin ley es alpaca', 'correccion');
    const fijado = ap.lista().find((a) => a.categoria === 'General')!;
    ap.alternarFijado(fijado.id);
    const orden = ap.relevantes('Cubertería de plata 916 en estuche').map((a) => a.categoria);
    expect(orden).toEqual(['General', 'Cuberterías', 'LEGO']);
  });

  it('limita lo que se envía y edita sin perder datos', () => {
    for (let i = 0; i < 50; i++) ap.anadir('General', `nota ${i}`, 'manual');
    expect(ap.relevantes('').length).toBe(40);
    const id = ap.lista()[0].id;
    ap.editar(id, { texto: '  nuevo texto ', categoria: 'Libros' });
    expect(ap.lista()[0]).toEqual(jasmine.objectContaining({ id, texto: 'nuevo texto', categoria: 'Libros' }));
    ap.editar(id, { texto: '   ' });
    expect(ap.lista()[0].texto).toBe('nuevo texto');
  });

  it('el resumen del filtro va corto y pone las ventas al final', () => {
    ap.anadir('Menaje', 'x'.repeat(300), 'venta');
    ap.anadir('Vajillas', 'Pickman completa: 150 € en mano', 'manual');
    const r = ap.resumenFiltro().split('\n');
    expect(r[0]).toContain('Pickman');
    expect(r[1].length).toBeLessThan(180);
  });
});
