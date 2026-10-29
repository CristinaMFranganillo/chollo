import { ANEXOS, NUCLEO, instruccionesPara } from './conocimiento';

describe('Conocimiento por categoría', () => {
  it('separa el núcleo y los anexos de la skill', () => {
    expect(NUCLEO).toContain('Evaluar anuncio de segunda mano');
    expect(ANEXOS.map((a) => a.letra)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('envía solo la guía de cuberterías para un anuncio de plata', () => {
    const t = instruccionesPara('Cubertería plata 916 con estuche');
    expect(t).toContain('## Anexo A.');
    expect(t).not.toContain('## Anexo C.');
    expect(t).toContain('Se han omitido 4 anexos');
  });

  it('envía varias si el lote es mixto', () => {
    const t = instruccionesPara('Lote: vajilla Pickman y juegos de Game Boy');
    expect(t).toContain('## Anexo B.');
    expect(t).toContain('## Anexo D.');
    expect(t).not.toContain('## Anexo A.');
  });

  it('reconoce los libros de la lista de vigilancia', () => {
    const t = instruccionesPara('Rayuela, Cortázar, Sudamericana');
    expect(t).toContain('## Anexo E.');
    expect(t).not.toContain('## Anexo A.');
    expect(instruccionesPara('Primer romancero gitano, Revista de Occidente')).toContain('## Anexo E.');
    expect(instruccionesPara('Platero y yo antiguo')).toContain('Primer romancero gitano');
  });

  it('envía todas si no se reconoce la categoría o no hay texto', () => {
    expect(instruccionesPara('')).toContain('## Anexo D.');
    expect(instruccionesPara('cosas de casa variadas')).not.toContain('Se han omitido');
  });

  it('incluye los costes de Wallapop y ya no trata juguetes', () => {
    expect(NUCLEO).toContain('Wallapop en mano');
    expect(NUCLEO).toContain('cuándo conviene la compra en mano');
    expect(NUCLEO.toLowerCase()).not.toContain('juguete');
  });
});
