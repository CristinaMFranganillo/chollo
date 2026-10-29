import { Evaluacion } from './models';

/**
 * Modo demostración: devuelve una evaluación de ejemplo sin llamar a Gemini,
 * para probar la app (cola, cartera, historial…) antes de tener la clave.
 * Elige el ejemplo según palabras del texto del anuncio.
 */
export async function evaluacionDemo(texto: string, precio: number | null, fotos: number): Promise<Evaluacion> {
  await new Promise((r) => setTimeout(r, 1200));
  const t = texto.toLowerCase();
  const p = precio ?? 40;
  const coste = Math.round((p * 1.05 + 0.7 + 4) * 100) / 100;

  const base = (ingreso: number): Pick<Evaluacion, 'coste_total_eur' | 'ingreso_neto_eur' | 'beneficio_neto_eur' | 'multiplo'> => ({
    coste_total_eur: coste,
    ingreso_neto_eur: ingreso,
    beneficio_neto_eur: Math.round(ingreso - coste),
    multiplo: Math.round((ingreso / coste) * 10) / 10,
  });

  if (/plated|plateado|ba[ñn]ad/.test(t)) {
    return {
      nota: 'DESCARTADO', motivo: 'DEMO · Metal plateado sin marca: no tiene valor de plata', categoria: 'Cuberterías',
      ...base(Math.round(p * 0.4)), oferta_maxima_eur: null,
      piezas: [{ nombre: 'Cubertería plateada en estuche', confianza: 'probable', precio_min_eur: 30, precio_max_eur: 60, fuente: 'Ejemplo de demostración' }],
      revender_o_guardar: 'Ninguna de las dos.', como_venderlo: 'No compensa revenderla.',
      riesgos: ['Baño gastado en las cucharas'], preguntas_vendedor: ['¿Tiene alguna marca además de "silver plated"?'],
    };
  }
  if (/plata|916|925|christofle|jensen/.test(t)) {
    const ingreso = Math.max(p * 3.2, 180);
    return {
      nota: 'CHOLLO', motivo: 'DEMO · Plata de ley por debajo de su valor al peso', categoria: 'Cuberterías',
      ...base(Math.round(ingreso)), oferta_maxima_eur: null,
      piezas: [{ nombre: 'Cubertería plata 916, 6 servicios', confianza: 'probable', precio_min_eur: Math.round(ingreso * 0.9), precio_max_eur: Math.round(ingreso * 1.3), fuente: 'Ejemplo de demostración' }],
      revender_o_guardar: 'Guardar: plata comprada por debajo de su valor al peso.',
      como_venderlo: 'todocoleccion o Catawiki, juego completo con punzones y peso.',
      riesgos: ['Confirmar punzones de ley', 'Descontar cuchillos con mango relleno'],
      preguntas_vendedor: ['¿Puedes enviar una foto de cerca de los punzones?', '¿Cuánto pesa sin los cuchillos?'],
    };
  }
  if (/lego|playmobil|exin|scalextric|nancy|madelman/.test(t)) {
    const ingreso = Math.round(p * 2.3);
    return {
      nota: 'BUENO', motivo: 'DEMO · Lote con piezas de colección identificables', categoria: /lego/.test(t) ? 'LEGO' : 'Juguetes españoles',
      ...base(ingreso), oferta_maxima_eur: null,
      piezas: [{ nombre: 'Set descatalogado (posible)', confianza: 'posible', precio_min_eur: Math.round(ingreso * 0.8), precio_max_eur: Math.round(ingreso * 1.2), fuente: 'Ejemplo de demostración' }],
      revender_o_guardar: 'Revender.', como_venderlo: 'BrickLink o todocoleccion, por sets completos.',
      riesgos: ['Puede estar incompleto'], preguntas_vendedor: ['¿Están todas las piezas e instrucciones?'],
    };
  }
  const ingreso = Math.round(p * 1.6);
  return {
    nota: 'NEGOCIABLE', motivo: `DEMO · Interesante, pero faltan datos${fotos ? '' : ' (sin capturas)'}`, categoria: 'Otra',
    ...base(ingreso), oferta_maxima_eur: Math.round(p * 0.75),
    piezas: [], revender_o_guardar: 'Revender si se compra a la oferta máxima.', como_venderlo: 'Wallapop o Vinted.',
    riesgos: ['Identificación sin confirmar'], preguntas_vendedor: ['¿Tiene alguna marca o sello en la base?'],
  };
}
