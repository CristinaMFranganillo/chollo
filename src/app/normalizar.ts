import { AnuncioVenta, Evaluacion, Nota, PiezaValorada } from './models';

/**
 * Las respuestas de la IA no siempre cumplen el formato al pie de la letra: números como texto
 * ("1.234,50 €"), notas en minúsculas, campos que faltan… Aquí se dejan en un formato fiable
 * para que la app no se rompa ni muestre "NaN".
 */

/** Saca el primer objeto JSON de un texto (quita ```json, explicaciones antes o después, etc.). */
export function extraerObjetoJson(texto: string): unknown {
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio === -1 || fin <= inicio) {
    throw new Error('La IA no devolvió una respuesta con el formato esperado. Prueba otra vez.');
  }
  try {
    return JSON.parse(texto.slice(inicio, fin + 1));
  } catch {
    throw new Error('La respuesta de la IA llegó incompleta o mal formada. Prueba otra vez.');
  }
}

/** Convierte "1.234,50 €", "45", 45 o "45.5" en número; null si no hay número. */
export function aNumero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  let t = v.replace(/[^\d.,-]/g, '');
  if (!t || !/\d/.test(t)) return null;
  if (t.includes(',') && t.includes('.')) {
    // Formato español: punto de miles y coma decimal.
    t = t.replace(/\./g, '').replace(',', '.');
  } else if (t.includes(',')) {
    t = t.replace(',', '.');
  } else if ((t.match(/\./g) ?? []).length > 1) {
    t = t.replace(/\./g, '');
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));
const textos = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(texto).filter(Boolean) : typeof v === 'string' && v.trim() ? [v.trim()] : [];
const redondear = (n: number, decimales = 2) => Math.round(n * 10 ** decimales) / 10 ** decimales;

/** Nota a partir de lo que diga la IA; si no se entiende, se deduce del múltiplo. */
export function aNota(v: unknown, multiplo: number | null): Nota {
  const t = texto(v).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (t.includes('CHOLLO')) return 'CHOLLO';
  if (t.includes('BUEN')) return 'BUENO';
  if (t.includes('NEGOCI')) return 'NEGOCIABLE';
  if (t.includes('DESCART') || t.includes('PASAR')) return 'DESCARTADO';
  if (multiplo == null) return 'DESCARTADO';
  if (multiplo >= 3) return 'CHOLLO';
  if (multiplo >= 2) return 'BUENO';
  if (multiplo >= 1.3) return 'NEGOCIABLE';
  return 'DESCARTADO';
}

function aPieza(v: unknown): PiezaValorada | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const nombre = texto(o['nombre']);
  if (!nombre) return null;
  const c = texto(o['confianza']).toLowerCase();
  const min = aNumero(o['precio_min_eur']) ?? 0;
  const max = aNumero(o['precio_max_eur']) ?? min;
  return {
    nombre,
    confianza: c.startsWith('seg') ? 'segura' : c.startsWith('prob') ? 'probable' : 'posible',
    precio_min_eur: Math.min(min, max),
    precio_max_eur: Math.max(min, max),
    fuente: texto(o['fuente']),
  };
}

export function normalizarEvaluacion(bruto: unknown): Evaluacion {
  const o = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const coste = aNumero(o['coste_total_eur']) ?? 0;
  const ingreso = aNumero(o['ingreso_neto_eur']) ?? 0;
  let multiplo = aNumero(o['multiplo']);
  if (multiplo == null && coste > 0) multiplo = ingreso / coste;
  const beneficio = aNumero(o['beneficio_neto_eur']) ?? ingreso - coste;
  return {
    nota: aNota(o['nota'], multiplo),
    motivo: texto(o['motivo']),
    categoria: texto(o['categoria']) || 'Otra',
    multiplo: redondear(multiplo ?? 0, 1),
    coste_total_eur: redondear(coste),
    ingreso_neto_eur: redondear(ingreso),
    beneficio_neto_eur: redondear(beneficio),
    oferta_maxima_eur: aNumero(o['oferta_maxima_eur']),
    piezas: Array.isArray(o['piezas']) ? o['piezas'].map(aPieza).filter((p): p is PiezaValorada => !!p) : [],
    revender_o_guardar: texto(o['revender_o_guardar']),
    como_venderlo: texto(o['como_venderlo']),
    riesgos: textos(o['riesgos']),
    preguntas_vendedor: textos(o['preguntas_vendedor']),
  };
}

export function normalizarAnuncio(bruto: unknown): AnuncioVenta {
  const o = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const salida = aNumero(o['precio_salida_eur']) ?? 0;
  const minimo = aNumero(o['precio_minimo_eur']) ?? salida;
  return {
    titulo: texto(o['titulo']).slice(0, 100),
    descripcion: texto(o['descripcion']),
    precio_salida_eur: Math.round(Math.max(salida, minimo)),
    precio_minimo_eur: Math.round(Math.min(salida || minimo, minimo)),
    canal: texto(o['canal']),
    palabras_clave: textos(o['palabras_clave']),
    consejos_fotos: textos(o['consejos_fotos']),
  };
}
