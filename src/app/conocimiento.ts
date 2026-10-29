import { SKILL_PROMPT } from './skill-prompt';

/**
 * Las guías expertas (anexos de la skill) son largas. Para no enviarlas todas en cada petición,
 * se detecta la categoría por el texto del anuncio y solo se adjuntan las que tocan.
 * Si no se reconoce ninguna (por ejemplo, solo hay capturas), se envían todas.
 */
const PALABRAS: Record<string, RegExp> = {
  A: /plata|cubert|cubiert|cuchar|tenedor|punz|christofle|meneses|wmf|alpaca|platead|silver|ercuis|jensen|916|925/i,
  B: /vajilla|plato|loza|porcelana|sargadelos|pickman|cartuja|sopera|fuente|bidasoa|claudio|santa clara|taza|limoges|vista alegre/i,
  C: /lego|minifig|bricklink|ninjago|technic|duplo/i,
  E: /libro|novela|primera edici|rayuela|cien a[ñn]os de soledad|sombra del viento|pascual duarte|colmena|cinco horas con mario|harry potter|sudamericana|biblioteca/i,
  D: /game ?boy|gba|nintendo|n64|snes|super nintendo|gamecube|game cube|consola|sega|playstation|ps1|ps2|cartucho|videojuego|pok[eé]mon/i,
};

interface Anexo {
  letra: string;
  texto: string;
}

const partes = SKILL_PROMPT.split(/\n(?=## Anexo [A-Z]\.)/);
export const NUCLEO = partes[0];
export const ANEXOS: Anexo[] = partes.slice(1).map((texto) => ({ letra: texto.match(/## Anexo ([A-Z])\./)?.[1] ?? '?', texto }));

/** Instrucciones de la skill con solo los anexos que corresponden al anuncio. */
export function instruccionesPara(textoAnuncio: string): string {
  const elegidos = textoAnuncio.trim()
    ? ANEXOS.filter((a) => PALABRAS[a.letra]?.test(textoAnuncio))
    : [];
  const usados = elegidos.length ? elegidos : ANEXOS;
  const omitidos = ANEXOS.length - usados.length;
  return [
    NUCLEO,
    ...usados.map((a) => a.texto),
    omitidos ? `\n(Se han omitido ${omitidos} anexos de otras categorías que no corresponden a este anuncio.)` : '',
  ].join('\n');
}
