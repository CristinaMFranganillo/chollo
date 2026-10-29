import { markdownAHtml } from './markdown';

describe('markdownAHtml', () => {
  it('convierte títulos, listas, negrita y tablas', () => {
    const html = markdownAHtml('### Punzones\n\n- **916**: ley española\n- 925\n\n| Marca | Época |\n| --- | --- |\n| Meneses | 1900 |');
    expect(html).toContain('<h4>Punzones</h4>');
    expect(html).toContain('<ul><li><strong>916</strong>: ley española</li><li>925</li></ul>');
    expect(html).toContain('<th>Marca</th>');
    expect(html).toContain('<td>Meneses</td>');
    expect(html).not.toContain('---');
  });

  it('escapa el HTML del texto', () => {
    expect(markdownAHtml('<script>x</script>')).toBe('<p>&lt;script&gt;x&lt;/script&gt;</p>');
  });
});
