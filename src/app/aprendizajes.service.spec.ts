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
});
