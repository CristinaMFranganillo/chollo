import { fetchConReintentos } from './red';

describe('fetchConReintentos', () => {
  let original: typeof fetch;
  beforeEach(() => (original = window.fetch));
  afterEach(() => (window.fetch = original));

  it('reintenta tras un 429 y devuelve la respuesta buena', async () => {
    let llamadas = 0;
    window.fetch = (async () => {
      llamadas++;
      return new Response('{}', { status: llamadas === 1 ? 429 : 200 });
    }) as typeof fetch;
    const r = await fetchConReintentos('https://x', {}, 3, 1);
    expect(r.status).toBe(200);
    expect(llamadas).toBe(2);
  });

  it('no reintenta errores que no se arreglan solos (400)', async () => {
    let llamadas = 0;
    window.fetch = (async () => {
      llamadas++;
      return new Response('{}', { status: 400 });
    }) as typeof fetch;
    const r = await fetchConReintentos('https://x', {}, 3, 1);
    expect(r.status).toBe(400);
    expect(llamadas).toBe(1);
  });

  it('da un error claro si no hay conexión', async () => {
    window.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    await expectAsync(fetchConReintentos('https://x', {}, 2, 1)).toBeRejectedWithError(/conexión/);
  });
});
