import { ANEXOS, NUCLEO, instruccionesPara } from './conocimiento';

describe('Conocimiento por categoría', () => {
  it('separa el núcleo y los anexos de la skill', () => {
    expect(NUCLEO).toContain('Evaluar anuncio de segunda mano');
    expect(ANEXOS.map((a) => a.letra)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('envía solo la guía de cuberterías para un anuncio de plata', () => {
    const t = instruccionesPara('Cubertería plata 916 con estuche');
    expect(t).toContain('## Anexo A.');
    expect(t).not.toContain('## Anexo C.');
    expect(t).toContain('Se han omitido 3 anexos');
  });

  it('envía varias si el lote es mixto', () => {
    const t = instruccionesPara('Lote: vajilla Pickman y juegos de Game Boy');
    expect(t).toContain('## Anexo B.');
    expect(t).toContain('## Anexo D.');
    expect(t).not.toContain('## Anexo A.');
  });

  it('envía todas si no se reconoce la categoría o no hay texto', () => {
    expect(instruccionesPara('')).toContain('## Anexo D.');
    expect(instruccionesPara('cosas de casa variadas')).not.toContain('Se han omitido');
  });
});
