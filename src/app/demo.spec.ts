import { evaluacionDemo } from './demo';

describe('Modo demostración', () => {
  it('descarta el metal plateado', async () => {
    const r = await evaluacionDemo('Cubertería silver plated China', 100, 2);
    expect(r.nota).toBe('DESCARTADO');
    expect(r.beneficio_neto_eur).toBeLessThan(0);
  });

  it('marca la plata de ley como chollo', async () => {
    const r = await evaluacionDemo('Cubertería plata 916', 60, 3);
    expect(r.nota).toBe('CHOLLO');
    expect(r.multiplo).toBeGreaterThanOrEqual(2.5);
  });
});
