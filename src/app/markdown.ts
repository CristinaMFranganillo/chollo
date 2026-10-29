/**
 * Markdown mínimo para leer las guías dentro de la app: títulos, listas, tablas, negrita y párrafos.
 * Primero se escapa todo el HTML, así que el resultado solo contiene las etiquetas que genera esta función.
 */
const escapar = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const enLinea = (t: string): string =>
  escapar(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

const celdas = (fila: string): string[] =>
  fila.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export function markdownAHtml(md: string): string {
  const lineas = md.split('\n');
  const salida: string[] = [];
  let lista: 'ul' | 'ol' | null = null;
  let parrafo: string[] = [];

  const cerrarParrafo = () => {
    if (parrafo.length) salida.push(`<p>${enLinea(parrafo.join(' '))}</p>`);
    parrafo = [];
  };
  const cerrarLista = () => {
    if (lista) salida.push(`</${lista}>`);
    lista = null;
  };

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const t = linea.trim();

    if (!t) {
      cerrarParrafo();
      cerrarLista();
      continue;
    }

    const titulo = t.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) {
      cerrarParrafo();
      cerrarLista();
      // Dentro de la app, el título del anexo ya está en la tarjeta: los niveles bajan a h3/h4.
      const nivel = Math.min(Math.max(titulo[1].length + 1, 3), 4);
      salida.push(`<h${nivel}>${enLinea(titulo[2])}</h${nivel}>`);
      continue;
    }

    if (t.startsWith('|')) {
      cerrarParrafo();
      cerrarLista();
      const filas: string[] = [];
      while (i < lineas.length && lineas[i].trim().startsWith('|')) filas.push(lineas[i++]);
      i--;
      const [cabecera, ...resto] = filas;
      const cuerpo = resto.filter((f) => !/^\s*\|?\s*:?-{2,}/.test(f));
      salida.push(
        '<div class="tabla"><table><thead><tr>' +
          celdas(cabecera).map((c) => `<th>${enLinea(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          cuerpo.map((f) => '<tr>' + celdas(f).map((c) => `<td>${enLinea(c)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>',
      );
      continue;
    }

    const vineta = linea.match(/^\s*[-*]\s+(.*)$/);
    const numero = linea.match(/^\s*\d+[.)]\s+(.*)$/);
    if (vineta || numero) {
      cerrarParrafo();
      const tipo = vineta ? 'ul' : 'ol';
      if (lista !== tipo) {
        cerrarLista();
        salida.push(`<${tipo}>`);
        lista = tipo;
      }
      salida.push(`<li>${enLinea((vineta ?? numero)![1])}</li>`);
      continue;
    }

    cerrarLista();
    parrafo.push(t);
  }
  cerrarParrafo();
  cerrarLista();
  return salida.join('');
}
