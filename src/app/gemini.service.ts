import { Injectable, inject } from '@angular/core';
import { AjustesService } from './ajustes.service';
import { AnuncioVenta, ArticuloCartera, Evaluacion } from './models';
import { SKILL_PROMPT } from './skill-prompt';
import { imagenABase64 } from './imagenes';
import { anuncioDemo, evaluacionDemo } from './demo';

const URL_API = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Formato de salida. Sustituye la sección "Formato de respuesta" de la skill:
 * la app necesita un JSON fijo para pintar la tarjeta y filtrar por nota.
 */
const FORMATO_JSON = `
## Formato de salida para la app (obligatorio)

Ignora el formato de respuesta en texto de la sección 8. Responde ÚNICAMENTE con un objeto JSON válido,
sin texto antes ni después y sin bloques de código, con exactamente estas claves:

{
  "nota": "CHOLLO" | "BUENO" | "NEGOCIABLE" | "DESCARTADO",
  "motivo": "una frase con el porqué",
  "categoria": "LEGO | Retro | Juguetes españoles | Vajillas | Cuberterías | Menaje | Cristalería | Decoración y herrajes | Mixto | Otra",
  "multiplo": número (ingreso neto / coste total, con un decimal),
  "coste_total_eur": número,
  "ingreso_neto_eur": número (conservador),
  "beneficio_neto_eur": número (ingreso neto − coste total),
  "oferta_maxima_eur": número o null (solo si la nota es NEGOCIABLE),
  "piezas": [{ "nombre": texto, "confianza": "segura" | "probable" | "posible", "precio_min_eur": número, "precio_max_eur": número, "fuente": texto con fuente y fecha }],
  "revender_o_guardar": "una línea",
  "como_venderlo": "una o dos líneas: comprador, canal y presentación",
  "riesgos": [textos cortos],
  "preguntas_vendedor": [1 a 3 preguntas]
}

Si no hay datos suficientes para valorar, usa la nota DESCARTADO, explica qué falta en "motivo"
y pon en "preguntas_vendedor" lo que habría que pedir.`;

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly ajustes = inject(AjustesService);

  async evaluar(texto: string, precio: number | null, fotos: File[]): Promise<Evaluacion> {
    const { apiKey, modelo, buscarPrecios, demo } = this.ajustes.ajustes();
    if (demo) {
      return evaluacionDemo(texto, precio, fotos.length);
    }
    if (!apiKey) {
      throw new Error('Falta la clave de la API de Gemini. Añádela en Ajustes.');
    }

    // 1. Preparamos las fotos (reducidas) como partes "inline_data".
    const imagenes = await Promise.all(fotos.map((f) => imagenABase64(f)));

    // 2. Texto del usuario: lo que sabemos del anuncio.
    const mensaje = [
      'Evalúa este anuncio.',
      precio != null ? `Precio pedido: ${precio} €.` : 'Precio: no indicado (búscalo en las capturas).',
      texto ? `Texto del anuncio:\n${texto}` : 'Sin texto: usa las capturas.',
      `Fotos adjuntas: ${imagenes.length}.`,
      `Fecha de hoy: ${new Date().toISOString().slice(0, 10)}.`,
    ].join('\n');

    // 3. Cuerpo de la petición a la API REST de Gemini.
    const cuerpo: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: SKILL_PROMPT + FORMATO_JSON }] },
      contents: [
        {
          role: 'user',
          parts: [
            { text: mensaje },
            ...imagenes.map((data) => ({ inline_data: { mime_type: 'image/jpeg', data } })),
          ],
        },
      ],
      generationConfig: buscarPrecios
        ? { temperature: 0.2 }
        : // Sin búsqueda podemos forzar JSON puro.
          { temperature: 0.2, responseMimeType: 'application/json' },
    };
    if (buscarPrecios) {
      // Búsqueda de Google para encontrar precios reales de comparables.
      cuerpo['tools'] = [{ google_search: {} }];
    }

    const respuesta = await fetch(`${URL_API}/${modelo}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(cuerpo),
    });

    if (!respuesta.ok) {
      throw new Error(mensajeError(respuesta.status, await respuesta.text()));
    }

    const datos = await respuesta.json();
    const textoRespuesta: string = (datos?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? '')
      .join('');

    return this.extraerJson(textoRespuesta);
  }

  /**
   * Redacta un anuncio para revender un artículo de la cartera: título con las palabras que
   * buscan los compradores, descripción honesta, precio de salida y mínimo, y canal recomendado.
   */
  async redactarAnuncio(a: ArticuloCartera): Promise<AnuncioVenta> {
    const { apiKey, modelo, demo } = this.ajustes.ajustes();
    if (demo) return anuncioDemo(a);
    if (!apiKey) throw new Error('Falta la clave de la API de Gemini. Añádela en Ajustes.');

    const instrucciones = `Eres experta en vender artículos de segunda mano en España (Wallapop, Vinted, todocoleccion, eBay, Catawiki).
Redacta un anuncio para vender el artículo que te describen. Reglas:
- Título de máximo 70 caracteres que empiece por marca y modelo y use las palabras que buscan los compradores. Sin emojis ni mayúsculas gritonas.
- Descripción en español, clara y honesta: qué es, marca, modelo o época, material, medidas o número de piezas si se conocen, estado real con los defectos, y cómo se envía o entrega. 5 a 10 líneas. No inventes datos que no te den: si falta algo importante, escribe [completar: …] para que el vendedor lo rellene.
- Precio de salida algo por encima del valor estimado para dejar margen a ofertas, y precio mínimo aceptable.
- Canal donde mejor se vende ese tipo de artículo y por qué, en una frase.
- 5 a 10 palabras clave para el título o las etiquetas.
- 3 a 5 consejos de fotos concretos para ese artículo (por ejemplo, punzones, sello de la base, número de set).
Responde SOLO con JSON: {"titulo": "", "descripcion": "", "precio_salida_eur": número, "precio_minimo_eur": número, "canal": "", "palabras_clave": [], "consejos_fotos": []}`;

    const datos = [
      `Artículo: ${a.titulo}`,
      `Categoría: ${a.categoria}`,
      `Coste de compra: ${a.costeTotal} €`,
      a.valorEstimado != null ? `Valor de reventa estimado: ${a.valorEstimado} €` : '',
      a.notas ? `Notas del vendedor: ${a.notas}` : '',
      a.canalVenta ? `Canal preferido: ${a.canalVenta}` : '',
    ].filter(Boolean).join('\n');

    const respuesta = await fetch(`${URL_API}/${modelo}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instrucciones }] },
        contents: [{ role: 'user', parts: [{ text: datos }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      }),
    });
    if (!respuesta.ok) throw new Error(mensajeError(respuesta.status, await respuesta.text()));
    const json = await respuesta.json();
    const texto: string = (json?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
    const anuncio = JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)) as AnuncioVenta;
    anuncio.palabras_clave ??= [];
    anuncio.consejos_fotos ??= [];
    return anuncio;
  }

  /** Comprueba que la clave funciona pidiendo la lista de modelos (no gasta cuota de generación). */
  async probarClave(apiKey: string): Promise<string> {
    if (!apiKey.trim()) throw new Error('Escribe primero la clave.');
    const respuesta = await fetch(URL_API, { headers: { 'x-goog-api-key': apiKey.trim() } });
    if (!respuesta.ok) throw new Error(mensajeError(respuesta.status, await respuesta.text()));
    return 'La clave funciona.';
  }

  /** Con la búsqueda activada el modelo a veces añade texto o ```json: nos quedamos con el objeto. */
  private extraerJson(texto: string): Evaluacion {
    const inicio = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
    if (inicio === -1 || fin === -1) {
      throw new Error('El modelo no devolvió un JSON. Respuesta: ' + texto.slice(0, 200));
    }
    const evaluacion = JSON.parse(texto.slice(inicio, fin + 1)) as Evaluacion;
    evaluacion.piezas ??= [];
    evaluacion.riesgos ??= [];
    evaluacion.preguntas_vendedor ??= [];
    return evaluacion;
  }
}

/** Traduce los errores habituales de la API a algo comprensible. */
function mensajeError(estado: number, detalle: string): string {
  if (estado === 400 && /API key/i.test(detalle)) return 'La clave de Gemini no es válida. Revísala en Ajustes.';
  if (estado === 400 || estado === 403) return 'Gemini ha rechazado la petición (clave sin permisos o región no disponible). ' + detalle.slice(0, 200);
  if (estado === 404) return 'El modelo indicado en Ajustes no existe. Prueba con gemini-2.5-flash.';
  if (estado === 429) return 'Has llegado al límite de la capa gratuita de Gemini. Espera un rato o prueba mañana.';
  if (estado >= 500) return 'Gemini no está respondiendo ahora mismo. Inténtalo de nuevo en unos minutos.';
  return `La API respondió ${estado}. ${detalle.slice(0, 200)}`;
}
