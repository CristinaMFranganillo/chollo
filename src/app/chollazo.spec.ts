import { avisoEsChollazo, esChollazo } from './chollazo';
import { Aviso, Evaluacion } from './models';
import { normalizarEvaluacion } from './normalizar';

const base = (cambios: Partial<Evaluacion>): Evaluacion =>
  ({ ...normalizarEvaluacion({ nota: 'CHOLLO', multiplo: 3.2, coste_total_eur: 30, ingreso_neto_eur: 96 }), ...cambios });

describe('chollazo', () => {
  it('un chollo normal no es chollazo', () => {
    expect(esChollazo(base({}))).toBeFalse();
  });

  it('es chollazo con múltiplo de 5, con 150 € de beneficio o si la IA lo marca', () => {
    expect(esChollazo(base({ multiplo: 5 }))).toBeTrue();
    expect(esChollazo(base({ beneficio_neto_eur: 150 }))).toBeTrue();
    expect(esChollazo(base({ chollazo: true }))).toBeTrue();
  });

  it('nunca es chollazo si la nota no es CHOLLO', () => {
    expect(esChollazo(base({ nota: 'BUENO', multiplo: 8, chollazo: true }))).toBeFalse();
  });

  it('lee la marca de la IA aunque venga como texto', () => {
    expect(normalizarEvaluacion({ nota: 'CHOLLO', chollazo: 'true' }).chollazo).toBeTrue();
    expect(normalizarEvaluacion({ nota: 'CHOLLO' }).chollazo).toBeFalse();
  });

  it('avisos de notificaciones: CHOLLO con múltiplo de 5 o marcado', () => {
    const aviso: Aviso = { id: '1', fecha: 0, app: 'Vinted', titulo: '', texto: '', nota: 'CHOLLO', motivo: '', multiplo: 4 };
    expect(avisoEsChollazo(aviso)).toBeFalse();
    expect(avisoEsChollazo({ ...aviso, multiplo: 6 })).toBeTrue();
    expect(avisoEsChollazo({ ...aviso, chollazo: true })).toBeTrue();
    expect(avisoEsChollazo({ ...aviso, nota: 'BUENO', multiplo: 9 })).toBeFalse();
  });
});
