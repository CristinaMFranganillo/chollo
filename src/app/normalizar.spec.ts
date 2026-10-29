import { aNota, aNumero, extraerObjetoJson, normalizarAnuncio, normalizarEvaluacion } from './normalizar';

describe('Normalizar respuestas de la IA', () => {
  it('entiende números en formatos variados', () => {
    expect(aNumero(45)).toBe(45);
    expect(aNumero('45')).toBe(45);
    expect(aNumero('45,5 €')).toBe(45.5);
    expect(aNumero('1.234,50 €')).toBe(1234.5);
    expect(aNumero('1.234.567')).toBe(1234567);
    expect(aNumero('12.5')).toBe(12.5);
    expect(aNumero('sin precio')).toBeNull();
    expect(aNumero(null)).toBeNull();
  });

  it('entiende la nota aunque venga mal escrita o la deduce del múltiplo', () => {
    expect(aNota('chollo', null)).toBe('CHOLLO');
    expect(aNota('Buena compra', null)).toBe('BUENO');
    expect(aNota('negociable', null)).toBe('NEGOCIABLE');
    expect(aNota('pasar', 5)).toBe('DESCARTADO');
    expect(aNota('', 3.4)).toBe('CHOLLO');
    expect(aNota(undefined, 1.5)).toBe('NEGOCIABLE');
  });

  it('extrae el JSON aunque venga con texto o ```json alrededor', () => {
    expect(extraerObjetoJson('Aquí tienes:\n```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    expect(() => extraerObjetoJson('sin json')).toThrow();
  });

  it('completa una evaluación incompleta sin romperse', () => {
    const e = normalizarEvaluacion({
      nota: 'bueno',
      coste_total_eur: '50 €',
      ingreso_neto_eur: '120,00',
      piezas: [{ nombre: 'Set 10182', confianza: 'Seguro', precio_min_eur: '150', precio_max_eur: '100' }, { sinNombre: true }],
      riesgos: 'Puede faltar una minifigura',
    });
    expect(e.nota).toBe('BUENO');
    expect(e.multiplo).toBe(2.4);
    expect(e.beneficio_neto_eur).toBe(70);
    expect(e.piezas.length).toBe(1);
    expect(e.piezas[0].confianza).toBe('segura');
    expect(e.piezas[0].precio_min_eur).toBe(100);
    expect(e.riesgos).toEqual(['Puede faltar una minifigura']);
    expect(e.preguntas_vendedor).toEqual([]);
    expect(e.oferta_maxima_eur).toBeNull();
  });

  it('ordena precios del anuncio si vienen al revés', () => {
    const a = normalizarAnuncio({ titulo: 'X', precio_salida_eur: '80', precio_minimo_eur: '95', palabras_clave: 'lego' });
    expect(a.precio_salida_eur).toBe(95);
    expect(a.precio_minimo_eur).toBe(80);
    expect(a.palabras_clave).toEqual(['lego']);
  });
});
