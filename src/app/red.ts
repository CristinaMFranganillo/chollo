/** Errores que suelen arreglarse solos esperando un poco: límite por minuto y servidor saturado. */
const REINTENTABLES = new Set([429, 500, 502, 503, 504]);

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch con reintentos: si Gemini responde "demasiadas peticiones" o "saturado", espera
 * (lo que diga Retry-After, o 2 s, 6 s…) y lo vuelve a intentar antes de dar error.
 */
export async function fetchConReintentos(
  url: string,
  init: RequestInit,
  intentos = 3,
  pausaBase = 2000,
): Promise<Response> {
  for (let i = 0; i < intentos; i++) {
    try {
      const respuesta = await fetch(url, init);
      if (!REINTENTABLES.has(respuesta.status) || i === intentos - 1) return respuesta;
      const retryAfter = Number(respuesta.headers.get('retry-after'));
      await esperar(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 60) * 1000 : pausaBase * 3 ** i);
    } catch {
      // Sin conexión o corte de red: reintentamos y, si no, error claro.
      if (i === intentos - 1) break;
      await esperar(pausaBase);
    }
  }
  throw new Error('No hay conexión con Gemini. Comprueba internet y vuelve a intentarlo.');
}
