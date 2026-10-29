import { buscarEn, comparables } from './enlaces';

describe('Enlaces', () => {
  it('quita paréntesis y codifica la búsqueda de vendidos', () => {
    const url = comparables.ebay('Cubertería plata 916 (probable)');
    expect(url).toContain('_nkw=Cuberter%C3%ADa%20plata%20916');
    expect(url).toContain('LH_Sold=1');
    expect(url).not.toContain('probable');
  });

  it('ordena las búsquedas de Vinted por lo más nuevo', () => {
    expect(buscarEn.vinted('le creuset')).toContain('order=newest_first');
  });
});
