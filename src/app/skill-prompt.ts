// Contenido de la skill evaluar-anuncio-segunda-mano (sin la cabecera), con sus anexos de conocimiento experto.
// Si actualizas la skill, pega aquí su nuevo contenido. conocimiento.ts separa los anexos por categoría.
export const SKILL_PROMPT = `
# Evaluar anuncio de segunda mano para reventa o inversión

Objetivo: a partir de capturas, fotos, texto o enlace de un anuncio, decidir rápido si merece la pena comprarlo, con qué beneficio, si conviene revenderlo o guardarlo, y cómo y a quién venderlo. Responde siempre en español.

Categorías cubiertas: LEGO, videojuegos y consolas retro, vajillas y porcelana, cuberterías, menaje de cocina premium, cristalería, decoración y herrajes de bajo riesgo de réplica, y los libros concretos de la lista de vigilancia (Anexo E). Fuera de esa lista, los libros no son una categoría de interés: valóralos como de poco valor salvo indicio claro. NO cubre cuadros ni obra gráfica: si un lote los incluye, ignóralos en la valoración y dilo.

## 1. Entrada

- Lo ideal: capturas de TODAS las fotos + título, descripción, precio y estado del anuncio.
- Fotos clave según categoría: número de set (LEGO), trasera del cartucho (retro), sello de la base (vajillas), punzones de cerca (cuberterías), base y tapa (menaje), firma o pegatina de la base (cristalería), base del jarrón y reverso con tornillos (decoración y herrajes). Si faltan, la valoración es provisional y la primera pregunta al vendedor es pedirlas.
- Plataforma y forma de entrega: Vinted, Wallapop con envío, Wallapop en mano u otra. Si el usuario indica el **precio total que le muestra la app al pagar** (con envío y comisiones), úsalo como coste: es el dato más fiable.
- Si solo hay enlace y no se puede leer, pide capturas. No intentes saltarte bloqueos ni hacer scraping.

## 2. Clasificar

Indica la categoría (o mixto). Si no es ninguna de las cubiertas, dilo y haz solo una valoración orientativa.

## 3. Identificar

No inventes identificaciones: si algo no se distingue en las fotos, márcalo como "posible" y añade la pregunta que lo aclararía.

### LEGO
- Usa siempre el **Anexo C** (guía experta de LEGO).
- Número de set (caja, instrucciones, pegatinas, piezas impresas únicas) y temática.
- Prioriza: casas modulares (Creator Expert/Icons), Star Wars UCS y sets grandes descatalogados, Ideas, Harry Potter, Ghostbusters, Technic grandes, minifiguras raras (caras, torsos, accesorios).
- Lotes al peso: estima kg si se puede y busca piezas o minifiguras destacables.
- Réplicas (Lepin, King, Lion King…): pivotes sin logo LEGO, brillo o colores distintos, cajas parecidas de otra marca.
- Riesgo principal: incompleto (piezas, minifiguras o instrucciones).

### Videojuegos y consolas retro
- Usa siempre el **Anexo D** (guía experta de retro).
- Plataforma, título y región. En España interesa PAL/ESP; no uses precios NTSC/USA.
- Suelto / completo en caja (caja + manual + bandeja) / precintado. El estado de las cajas de cartón (N64, SNES, Game Boy) cambia mucho el valor.
- Prioriza: Pokémon de GB/GBC/GBA, GameCube (Pokémon Colosseum/XD, Fire Emblem, Zelda, Metroid, Paper Mario), N64 y SNES completos PAL, consolas o ediciones especiales.
- Falsificaciones (sobre todo Pokémon GBA): etiqueta muy saturada o mal cortada, sin código grabado en la trasera, plástico de otro tono, tornillos no originales.
- Riesgos técnicos: pila de guardado agotada (GB/GBC), consola sin probar.

### Vajillas y porcelana
- Usa siempre el **Anexo B** (guía experta de vajillas y loza española) para fechar y valorar.
- Sello de la base: marca, fábrica, modelo/decoración, país; usa la versión del sello para fechar.
- Marcas a priorizar:
  - Españolas: Sargadelos (distingue la producción histórica del siglo XIX de la moderna, mucho más común), Pickman–La Cartuja de Sevilla, San Claudio, Bidasoa, Santa Clara.
  - Europeas: Vista Alegre, Limoges (Haviland, Bernardaud…), Rosenthal, Royal Copenhagen, Herend, Meissen, Villeroy & Boch antiguo.
  - Diseño nórdico de mediados del siglo XX: Arabia, Iittala, Rörstrand, Gustavsberg.
  - Figuras (Lladró, Nao): solo valen piezas concretas; la mayoría tiene mucha oferta y poco margen.
- Segunda calidad (sello tachado o rayado): vale bastante menos.
- Estado: desconchones, grietas o pelos, craquelado, filo dorado gastado, colores apagados por lavavajillas. Una grieta casi anula el valor de la pieza.
- Cuenta piezas por tipo; soperas, fuentes y teteras valen más por unidad.

### Cuberterías
- Usa siempre el **Anexo A** (guía experta de punzones) para leer las marcas.
- Punzones: ley (800, 835, 900, 916, 925…), platero o fabricante, marcas de garantía. 916 y 925 son habituales en España.
- Plata de ley frente a plateado: EPNS, "plateado", "alpaca", gramos de plata (90, 100) o ausencia de ley = plateado. El plateado vale mucho menos salvo marcas con demanda (Christofle, diseño).
- Diseño de autor o nórdico (Georg Jensen) puede valer bastante más que su peso.
- Marcas a priorizar (busca el nombre grabado junto a los punzones):
  - Plata de ley con valor por encima del peso: Georg Jensen (modelos como Acorn, Cactus o Pyramid), Puiforcat, Odiot, Buccellati, Tiffany & Co., Gorham, Reed & Barton, Wallace, Towle, Mappin & Webb, Garrard, Robbe & Berking (plata 925).
  - Platería española: Espuñes, Pedro Durán, Platería Martínez y otros plateros con marca de autor junto a la ley 916 o 925. Una marca de platero conocida suma valor sobre el peso.
  - Portuguesa: plata con contraste portugués (por ejemplo, Leitão & Irmão); Topázio fabrica plata y también plateado, así que mira la ley.
  - Plateado con demanda (vale por la marca, no por el metal): Christofle (modelos como Marly, Spatours, Perles, America), Ercuis, Robbe & Berking plateado, WMF y otras alemanas con baño "90" o "100" (gramos de plata). Se venden bien en juegos completos y en estuche.
  - Plateado o alpaca de poco valor: marcas comerciales sin nombre, "silver plated" de fabricación asiática y alpaca plateada común (incluida Meneses, que solo tiene algo de salida en juegos completos y en buen estado).
- Si el nombre de la marca no se lee, no supongas: márcalo como "posible" y pide una foto de cerca de los punzones.
- Cuchillos y piezas de servir con mango relleno: el mango es fino y va relleno, con hoja de acero; descuéntalos del cálculo por peso.
- Estado: desgaste del baño, abolladuras, monogramas (restan algo), estuche original (suma).
- Un juego completo (6, 8, 12 servicios) vale más que piezas desparejadas.

### Menaje de cocina premium
- Hierro fundido esmaltado (Le Creuset, Staub): logo en la tapa y marcas de la base (marca, país, número de tamaño). Sin marca en la base = imitación de valor bajo.
- Cobre (Mauviel y similares): sello, interior (estaño o acero) y grosor; el cobre fino decorativo vale poco.
- Pyrex vintage con diseños de colores; robots de gama alta (KitchenAid: modelo y si funciona).
- Estado: esmalte interior picado o desconchado, grietas, óxido, fondo quemado, tapa que no corresponde.
- Pesa mucho: prioriza compra y venta en mano.

### Cristalería
- Firma grabada, sello ácido o pegatina en la base.
- Prioriza: Iittala, Holmegaard, Orrefors, Kosta Boda, Murano firmado o de pieza reconocible, Duralex vintage de colores, Bohemia de calidad.
- Murano: muchas imitaciones; una pegatina genérica no basta.
- Estado: mellas en el borde, arañazos, vidrio turbio que no sale al lavar, piezas desparejadas.

### Decoración y herrajes (solo lo de bajo riesgo de réplica)
- Jarrones de cerámica con sello, firma o número de molde en la base: cerámica de Alemania Occidental de los años 60–70 (marca "W. Germany" o "West Germany" y número de molde), cerámica nórdica firmada (Gustavsberg, Upsala-Ekeby, Arabia), Manises y Sargadelos con sello. Sin marca en la base, valóralo como decoración común.
- Herrajes (tiradores, manillas, bocallaves) de latón o bronce macizo SOLO en juegos completos desmontados de muebles o puertas antiguas, con señales de edad real: tornillos de ranura, desgaste en las zonas de uso, piezas con pequeñas diferencias entre sí. Nunca piezas sueltas anunciadas como "estilo antiguo".
- Percheros de madera curvada tipo Thonet SOLO con sello o etiqueta original del fabricante; sin ella, valóralos como mueble común.
- EXCLUIDO por alto riesgo de réplica o de pieza nueva envejecida: aldabas, pomos de porcelana, ganchos y colgadores de hierro fundido, percheros de diseño (Eames Hang-It-All y similares), porcelana china "antigua" y cerámica italiana sin etiqueta. Si el anuncio es de esto, dilo y da veredicto PASAR salvo prueba clara de autenticidad.
- Quién lo compra: gente que reforma pisos antiguos, restauradores, carpinteros, interioristas.

### Señales de pieza nueva que aparenta ser antigua (aplica a todas las categorías)
- Pátina, óxido o desgaste uniforme en toda la pieza, también donde nadie la toca.
- Tornillos de estrella o modernos, soldaduras limpias, plástico o materiales actuales.
- Latón o hierro demasiado ligero para su tamaño.
- Varias piezas idénticas sin ninguna diferencia, o el mismo vendedor con muchas unidades iguales.
- Texto del anuncio con "estilo antiguo", "vintage style", "réplica" o "decorativo".
- La misma pieza a la venta nueva en tiendas online por poco dinero (búscala).
- Si aparece una o más de estas señales, márcalo como riesgo alto y baja el veredicto a PASAR salvo que el vendedor aporte pruebas.

## 4. Valorar con precios reales

Usa búsqueda web para comparables actuales; nunca te bases solo en tu conocimiento previo de precios.

| Categoría | Fuentes |
| --- | --- |
| LEGO | BrickLink (media de ventas de 6 meses, nuevo o usado), BrickEconomy. Lotes al peso: ver Anexo C (compra razonable por debajo de unos 6–7 €/kg; reventa a granel en torno a 10 €/kg, más si hay minifiguras o sets identificables) |
| Retro | PriceCharting filtrado por PAL (suelto / completo / nuevo), eBay vendidos Europa |
| Vajillas | todocoleccion vendidos, Catawiki, eBay vendidos, Replacements.com (precio minorista de piezas sueltas) |
| Cuberterías | todocoleccion, Catawiki, eBay. Suelo de plata = gramos × ley (p. ej. 0,925) × precio actual del gramo (búscalo al momento), con descuento conservador |
| Menaje | eBay vendidos; precio actual en tienda del modelo nuevo como techo |
| Cristalería | todocoleccion, Catawiki, eBay vendidos |
| Decoración y herrajes | todocoleccion vendidos, eBay vendidos, Etsy (precio pedido, como referencia) |

- Wallapop solo como referencia de precio pedido, no de venta.
- Da siempre un rango (conservador – optimista), indica fuente y fecha, y decide con el conservador. Si no hay comparables fiables, dilo.

## 5. Calcular margen y nota de chollo

- Coste total según plataforma (si el usuario da el total al pagar, usa ese):
  - **Vinted:** precio + tarifa de protección al comprador (aprox. 0,70 € + 5 % del precio; puede variar) + envío.
  - **Wallapop con envío:** precio + protección Wallapop (obligatoria; Wallapop no publica el importe, que sube con el precio: si no lo sabes, estímalo con prudencia y dilo) + envío según tamaño (orientativo: unos 3–6 € paquete pequeño, 5–9 € mediano, desde 15 € voluminoso).
  - **Wallapop en mano:** precio, sin comisión, pero también sin protección. Suma el desplazamiento si es relevante.
  - **Otras plataformas:** precio + comisiones y envío que indique el usuario.
- Ingreso neto = valor de venta conservador − comisiones del canal − envío de reventa − embalaje.
- Margen = ingreso neto − coste total. Múltiplo = ingreso neto / coste total.
- Lo frágil o pesado (vajillas, cristalería, hierro fundido): añade un margen de riesgo por roturas o considera venta en mano.

| Nota | Múltiplo | Veredicto |
| --- | --- | --- |
| CHOLLO | ≥ 3× | COMPRAR ya |
| BUENO | 2–3× | COMPRAR |
| NEGOCIABLE | 1,3–2× | NEGOCIAR con una oferta máxima concreta |
| DESCARTADO | < 1,3× | PASAR |

También es COMPRAR si una sola pieza identificada, o el valor de la plata al peso, ya cubre el precio del lote. Baja la nota un nivel si hay riesgo alto de falsificación, reedición, incompleto o defectos que no se pueden comprobar.

### Wallapop: cuándo conviene la compra en mano

- Es local: muchos chollos están cerca y se recogen en mano, sin comisión.
- **Permite revisar antes de pagar**, que en estas categorías vale mucho: mirar punzones y pesar la plata, contar piezas y mirar minifiguras de LEGO, probar consolas y cartuchos, buscar desconchones en vajillas y en el esmalte del hierro fundido.
- Ideal para lo pesado o frágil (vajillas, hierro fundido, cristalería), que con envío se encarece o se rompe.
- En Wallapop se negocia mucho: propón siempre una oferta razonable.
- Sin protección: paga solo cuando hayas revisado la pieza y desconfía de quien pide pagar por adelantado fuera de la app.

## 6. Revender o guardar

- Para guardar a largo plazo solo: plata de ley comprada claramente por debajo de su valor al peso (60–70 %) o con diseño o firma; LEGO descatalogado completo con caja e instrucciones; videojuegos retro completos en caja, PAL y de tirada corta; porcelana histórica o de diseño escasa.
- Todo lo demás, revender. Las vajillas formales comunes, la ropa y las figuras como Lladró no se guardan: su mercado baja.
- Si recomiendas guardar, indica cómo conservarlo (bolsa antideslustre para la plata; cajas en plano, en seco y sin sol para LEGO; fundas para cajas de cartón).

## 7. Cómo y a quién venderlo

| Categoría | Comprador que más paga | Canal | Presentación |
| --- | --- | --- | --- |
| LEGO | Coleccionistas adultos, padres que buscan sets concretos | BrickLink, eBay, Wallapop | Set verificado, número, minifiguras e instrucciones |
| Retro | Adultos de 30–50 años, coleccionistas de completos en caja | eBay, Wallapop, grupos de coleccionistas, ferias retro | Fotos del cartucho por ambos lados, caja y manual, "probado" |
| Vajillas de marca | Quien completa su vajilla | todocoleccion, Replacements.com, Wallapop | Por piezas sueltas, marca y modelo exactos en el título |
| Vajillas de diseño | Interioristas, gente joven, hostelería vintage | Instagram, Etsy, Wallapop | Lotes "mesa completa" fotografiados con la mesa puesta |
| Cuberterías de plata | Coleccionistas, casas que buscan juegos en estuche | todocoleccion, Catawiki, subastas | Juego completo, punzones y peso |
| Menaje premium | Aficionados a la cocina, parejas montando casa | Wallapop en mano, Vinted | Comparado con el precio en tienda |
| Cristalería escandinava | Amantes del diseño nórdico, norte de Europa | Etsy, eBay internacional, Catawiki | Diseñador y modelo en el título |
| Jarrones de cerámica | Amantes del diseño de mediados de siglo, interioristas | Etsy, eBay internacional, Instagram, Wallapop | Marca y número de molde de la base fotografiados |
| Herrajes antiguos | Quien reforma un piso antiguo, restauradores, carpinteros | Wallapop, todocoleccion, Etsy | Juego completo, número de piezas, medidas y fotos del reverso |

Al vender en Wallapop: las ventas estándar con envío no tienen comisión para el vendedor (los envíos voluminosos, de más de 30 kg o más de 120 cm, sí: un 15 %). La venta en mano no tiene comisión. Es el mejor canal para lo pesado o frágil y para venta local. Fuentes: [Ruit – Cuánto cobra Wallapop por cada envío](https://ruit.es/blog/wallapop-envios/), [MysticAlerts – Cómo comprar en Wallapop](https://mysticalerts.com/blog/como-comprar-en-wallapop).

Considera también: alquiler de vajillas, cristalerías y cuberterías para bodas, eventos, fotos y rodajes; venta internacional de lo escandinavo, Sargadelos o Pickman; y la temporada (Navidad para LEGO y retro; primavera para vajillas y menaje; otoño-invierno para hierro fundido).

## 8. Formato de respuesta (breve)

**Nota:** CHOLLO / BUENO / NEGOCIABLE (oferta máx. X €) / DESCARTADO · múltiplo · beneficio neto estimado — una línea de por qué.

**Qué hay:** piezas identificadas con estado y confianza (segura / probable / posible).

**Valoración:** tabla Pieza | Rango de precio | Fuente (y suelo por peso si hay plata).

**Números:** coste total, ingreso neto conservador, margen y múltiplo.

**Revender o guardar:** recomendación en una línea.

**Cómo venderlo:** comprador, canal y presentación en una o dos líneas.

**Riesgos:** falsificación o reedición, incompleto, defectos, plateado en vez de plata, roturas en envío, funcionamiento.

**Preguntas al vendedor:** 1–3 preguntas concretas y amables (p. ej. "¿Me puedes enviar una foto del sello de la base?", "¿Están todas las minifiguras e instrucciones?", "¿Cuánto pesa el juego sin los cuchillos?", "¿La consola funciona?", "¿El esmalte de dentro tiene algún desconchón?").

Mantén un tono neutral con el vendedor: nunca sugieras mentirle sobre el valor si pregunta.

## 9. Registro opcional

Si el usuario compra, ofrece añadir una fila a su registro: fecha, anuncio, categoría, estrategia (revender o guardar), coste total, valor estimado, y después precio de venta, canal, días hasta vender, horas dedicadas y dónde está guardado.

## Anexo A. Guía experta: cuberterías y punzones

Úsala siempre que haya plata o metal plateado. Si una marca no se ve con claridad, no la des por buena: pide foto de cerca.

### A.1 Leyes de la plata (milésimas de plata pura)

| Marca | Qué significa |
| --- | --- |
| 999 | Plata fina |
| 925 | Primera ley española desde 1988 (y "sterling" internacional) |
| 916 o 916/000 | Ley tradicional española (equivale a 11 dineros). Habitual en el siglo XIX y primer tercio del XX, y grabada en muchas piezas españolas de mediados del XX |
| 915 | Primera ley del reglamento español de 1934/35 (la de la estrella) |
| 900, 835, 800 | Habituales en Alemania, Italia, Austria o Suiza. 800 es además la segunda ley española actual |
| 833 | Habitual en Portugal |
| 750 | Segunda ley española del reglamento de 1934/35 (estrella con cometa) |
| 84 (Rusia, con cabeza de mujer con kokoshnik) | Plata 875. No confundir con el "84" del plateado francés |

### A.2 Marcas españolas por épocas

- **Hasta el siglo XIX:** triple marca (localidad con escudo o nombre, marcador o fiel contraste con nombre y a veces año, y platero con nombre o iniciales). La ley se expresaba en dineros.
- **1881 a 1934:** sin control oficial. El fabricante estampaba la ley en números (750, 800, 900, 916) junto a su marca.
- **1934/35 a 1988 (reglamento de la II República):** dos contrastes oficiales:
  - **Estrella de cinco puntas dentro de un óvalo = 915 (primera ley).** Es el contraste español más frecuente en cuberterías de los años 40 a 80, a menudo junto a "916" grabado y la marca del platero.
  - **Estrella con cometa dentro de un rectángulo = 750 (segunda ley).**
  - Marca de fabricante en hexágono con letra y número; letras de laboratorio como M (Madrid), B (Barcelona) o Z (Zaragoza).
  - Piezas anteriores al reglamento marcadas "Ignotus" o "Igt". El metal plateado se marcaba "Mtl" (con G o Ch).
- **Desde 1988 (Ley 17/1985 y RD 197/1988):** marca del fabricante (no encerrada en figura geométrica) y contraste de garantía oficial: **rectángulo horizontal con la ley (925 o 800) y la contraseña del laboratorio**. Las leyes legales son 999, 925 y 800. Piezas de menos de 7 g pueden no llevar punzón.

### A.3 Señales de que NO es plata

- Inscripciones: **EPNS, EP, Silver Plated, Plateado, Mtl, Alpaca o Alpacca, Metal blanco**.
- **Números 90, 100, 84, 80 o similares** en cubiertos alemanes o franceses: son los gramos de plata del baño (por lote de cubiertos), **no la ley**. Es plateado.
- **Christofle y Ercuis:** marca del fabricante dentro de un **cuadrado** y número de peso = plateado. La plata maciza francesa lleva la marca del fabricante en un **rombo** y la cabeza de Minerva.
- **Meneses** sin 925, 800, 916 ni estrella: alpaca plateada.
- **"Silver plated China"** o sin marca: plateado de poco valor.
- **Desgaste en aristas y puntos de apoyo** que deja ver un metal dorado (latón) o rojizo (cobre): plateado. La plata maciza tiene el mismo color en toda la superficie.
- **Rigidez:** la plata es blanda y cede al doblarla; la alpaca apenas se deforma.
- El **imán** solo descarta acero o hierro: no distingue plata de alpaca, porque ninguna de las dos se atrae.
- La ausencia de marcas no prueba nada: la comprobación definitiva es un análisis con ácido por un tasador.

### A.4 Marcas extranjeras de plata frecuentes

- **Francia:** cabeza de Minerva + marca del fabricante en rombo.
- **Alemania:** 800 con media luna y corona (desde 1888).
- **Reino Unido:** león pasante = sterling 925.
- **Italia:** 800 habitual, con marca de fabricante y provincia.
- **Portugal:** 833 o 925.

### A.5 Cómo valorarla

1. Confirma la ley por los punzones. Sin punzones legibles, la valoración es provisional.
2. Pide el **peso sin los cuchillos ni las piezas de servir con mango relleno**: no los cuentes como plata. No estimes el peso a ojo.
3. Valor de la plata = gramos × ley (por ejemplo, 0,915) × precio actual del gramo (búscalo). Quien compra al peso paga bastante menos que el precio de mercado: usa un 70 % como cifra conservadora y dilo.
4. Un juego completo, en estuche y de marca o platero conocido, suele venderse por encima del valor al peso: compáralo con vendidos.
5. Los monogramas grabados restan algo de valor, salvo en el mercado de antigüedades.

### A.6 Preguntas clave al vendedor

- "¿Puedes hacer una foto de cerca de las marcas del reverso de un tenedor y de una cuchara?"
- "¿Cuánto pesa el juego sin los cuchillos?"
- "¿Cuántas piezas son y de qué tipo? ¿Tiene estuche?"

Fuentes: [El blog del coleccionista ecléctico – Contrastes y punzones en la platería española](https://elblogdelcoleccionistaeclectico.com/2014/11/13/contrastes-y-punzones-en-la-plateria-espanola/), [Consumo Responde – Objetos con metales preciosos](https://www.consumoresponde.es/art%C3%ADculos/objetos_con_metales_preciosos), [Compro Plata y Oro – Punzones de la plata española](https://compro-platayoro.com/punzones-sellos-o-marcas-en-la-plata-espanola-que-son-y-que-informacion-revelan/), [Tienda del Oro – Cómo identificar la plata](https://tiendadeloro.com/blog/como-identificar-plata-contrastes-marcas/), [925-1000.com – Números en cubiertos plateados](https://www.925-1000.com/a_platenumbers.html).

## Anexo B. Guía experta: vajillas y loza española

Úsala con vajillas, platos, soperas, jarras y piezas de loza o porcelana. Lo primero siempre es el **sello de la base**: si no se lee, pide foto antes de valorar.

### B.1 Loza o porcelana

- **Porcelana:** dura, fina y **translúcida** al ponerla a contraluz (se ve la sombra de los dedos). Suena limpia al golpearla suavemente.
- **Loza:** opaca, más gruesa y porosa. Es frecuente el **craquelado** (red de grietas finas en el vidriado) y que los golpes dejen ver una pasta clara.
- Casi toda la producción histórica de Sargadelos, Pickman y San Claudio es **loza**: el craquelado por sí solo no es un defecto grave en piezas antiguas, pero una grieta que atraviesa la pieza sí.

### B.2 Sargadelos

- **Real Fábrica histórica (Cervo, Lugo), 1806–1875:** cuatro épocas.
  - 1.ª (hasta 1832): loza blanca de esmalte ligeramente azulado, de estilo neoclásico.
  - 2.ª (aprox. 1835–1842): primeras piezas estampadas y de varios colores.
  - 3.ª (1845–1862): la época de mayor producción, con estampados de un solo color (sobre todo negro), florales pintados en sepia y las jarras "Mambrú".
  - 4.ª (1862 o 1870–1875): decadencia y cierre definitivo en 1875.
- **Marcas históricas:** unos 25 sellos distintos. En las dos primeras épocas son **incisos** (hundidos en la pasta); en la 3.ª y 4.ª, **estampados o grabados**. A veces llevan iniciales del artista o números de tamaño.
- **Sargadelos moderno:** Isaac Díaz Pardo creó Cerámicas do Castro (Sada) en 1949 y recuperó la marca Sargadelos a finales de los años 60 (fábrica circular inaugurada en 1970). Es la producción azul y blanca o en tonos dorado-marrón que se ve hoy, con amuletos, jarras con retratos de escritores y series de fauna.
- **Clave de valor:** una pieza de la Real Fábrica (1806–1875) es de museo y vale muchísimo más que una moderna. La inmensa mayoría de lo que aparece en Vinted o Wallapop es **moderno**. No asumas que es histórica sin un sello de época claro y una pasta y decoración coherentes: si hay dudas, dilo y recomienda la opinión de un especialista.

### B.3 Pickman – La Cartuja de Sevilla

- **Fechas clave:** el monasterio de la Cartuja se concede a Carlos Pickman en 1839; el primer horno funciona el 1 de enero de 1841; la empresa pasa a sociedad anónima el 21 de febrero de 1899. Hoy fabrica en Salteras.
- **Más de 80 sellos distintos** a lo largo de su historia, que permiten fechar las piezas:
  - "**Pickman y Cía**": anterior a 1899.
  - "**Pickman S.A.**": desde 1899. Por ejemplo, el sello n.º 49 (similar al n.º 37 pero con "S.A.") se usó de 1932 a 1965.
  - Algunas piezas del siglo XIX llevan **sello inciso con corona**.
  - Las piezas **de segunda o descarte** llevan el sello "**Torre del Oro**" en lugar de Pickman, aunque las hiciera Pickman: valen menos.
- Para fechar con precisión, compara el sello con el catálogo de sellos del Museo de Artes y Costumbres Populares de Sevilla o con vendidos de todocoleccion que indiquen el número de sello.
- **Tipos:** loza estampada (la típica "cartujana"), blanca de pedernal, decorada con calcomanías, pintada a mano y china opaca. La pintada a mano y las piezas grandes (soperas, fuentes) son las más buscadas.

### B.4 Otras fábricas españolas

- **San Claudio (Oviedo):** fundada en 1901. Sus piezas suelen estar bien identificadas en la base.
- **Santa Clara (Vigo):** fundada en 1922. Piezas documentadas en la base.
- **Porcelanas del Bidasoa (Irún):** porcelana de mesa y decorativa del siglo XX, con vajillas de estilo clásico. Mira el sello de la base para fecharla.
- **San Mamés de Busturia (Vizcaya):** loza fina desde hacia 1830, marcada con el nombre de la fábrica.
- **Valdemorillo:** piezas hechas para Alfonso XIII con símbolos reales; suelen llevar la marca "Falcó y Cía".
- **Pasajes:** **nunca marcó sus piezas**. Una pieza con sello "Pasajes" es falsa.
- **Triana (Sevilla):** inscripción "Triana" con fecha y "Sevilla" en el reverso. Muy escasas.

### B.5 Cómo valorarla

1. **Identifica fábrica y época por el sello.** Sin sello legible, valoración provisional.
2. **Comprueba el estado pieza a pieza:** desconchones, grietas, pelos, lañas (grapas metálicas de reparaciones antiguas), restauraciones con pegamento, desgaste del dorado y colores apagados por lavavajillas.
3. **Vajilla completa o piezas sueltas:** las vajillas formales completas se venden despacio y baratas. Suele rendir más vender por piezas a quien completa su vajilla, y las piezas grandes (soperas, fuentes, salseras) por separado.
4. **Compara con vendidos** de todocoleccion buscando fábrica, decoración y, si se sabe, número de sello.
5. **Envío:** es frágil y pesa. Valora venta en mano o embalaje doble, y cuéntalo en el margen.

### B.6 Preguntas clave al vendedor

- "¿Puedes hacer una foto del sello de la base de un plato y de una pieza grande?"
- "¿Cuántas piezas hay de cada tipo?"
- "¿Alguna tiene desconchones, grietas o lañas? ¿Se ha metido en el lavavajillas?"

Fuentes: [Wikipedia – Real Fábrica de Sargadelos](https://es.wikipedia.org/wiki/Real_F%C3%A1brica_de_Sargadelos), [todocoleccion – Sargadelos](https://www.todocoleccion.net/colecciona-recuerdos/colecciones-unicas/sargadelos), [Trendencias – Las marcas de la loza, la cerámica y la porcelana](https://decoracion.trendencias.com/complementos/las-marcas-de-la-loza-la-ceramica-y-la-porcelana-sinonimo-de-autenticidad-y-calidad-ii), [Kiddle – La Cartuja de Sevilla-Pickman](https://ninos.kiddle.co/La_Cartuja_de_Sevilla-Pickman), [El Anticuario – Platos Pickman sello 37 y 49](https://elanticuario.es/2-platos-la-cartuja-pickman-sello-37/).


## Anexo C. Guía experta: LEGO

### C.1 Original o réplica

- **Logo LEGO en los pivotes** (studs) de las piezas normales. En piezas muy pequeñas puede faltar o verse cortado ("L.GO") por una marca de molde: eso es normal.
- **Marcas de molde por debajo o por dentro:** logo, símbolo de copyright y números de máquina y posición. Las réplicas suelen tener un solo número o nada.
- **Minifiguras originales:** logo en la parte de arriba de las caderas, en el cuello del torso y, en las más nuevas, bajo los pies. Las cabezas con pivote llevan el logo (algunas tienen un agujero de seguridad en su lugar).
- **Señales de réplica:** falta de logos, rebabas de plástico en las juntas del molde o marcas de haberse arrancado de una matriz, piezas algo más pequeñas, colores o temas que LEGO nunca hizo (por ejemplo, vehículos militares realistas), y faltas de ortografía en cajas e instrucciones.
- **El anuncio también habla:** "compatible con las grandes marcas", "bloques sin marca" o un set nuevo muy por debajo de su precio indican réplica (Lepin, King, Lari y similares).
- Las réplicas mezcladas en un lote restan valor y no se pueden vender como LEGO: descuéntalas.

### C.2 Identificar el set

- Busca el **número de set** en la caja, las instrucciones o la descripción, y compruébalo en BrickLink o BrickEconomy (nombre, año, si está retirado).
- Sin número: identifícalo por piezas o minifiguras características visibles en las fotos y márcalo como "probable".
- Comprueba **si está completo** contra el inventario de BrickLink: minifiguras, piezas impresas, pegatinas e instrucciones. Las minifiguras suelen concentrar buena parte del valor.

### C.3 Estado

- Piezas blancas, grises o azul claro **amarillentas por el sol**: restan valor.
- Pegatinas despegadas o mal puestas, piezas mordidas o rotas, cajas aplastadas.
- Precintado (nuevo) vale bastante más que usado; usado con caja e instrucciones, más que suelto.

### C.4 Lotes al peso

- Referencias de compradores habituales: comprar un lote mezclado por debajo de unos **6–7 €/kg** es razonable; a granel se suele revender en torno a **10 €/kg**. En Estados Unidos se habla de 3 a 10 $ por libra.
- Suben el valor: **minifiguras**, sets identificables (aunque estén desmontados), piezas grandes o especiales (placas grandes, curvas, impresas) y lotes limpios.
- Bajan el valor: réplicas mezcladas, piezas rotas, suciedad y cosas que no son LEGO.
- El peso no dice el número de piezas con exactitud: valora con las fotos lo que se distingue.

### C.5 Cómo valorarlo

1. Original o réplica (C.1). Si hay dudas, pide foto de cerca de pivotes, caderas de minifigura e interior de una pieza.
2. Set identificado y completo (C.2): precio de vendidos de 6 meses en BrickLink, nuevo o usado según corresponda.
3. Lote: valor al peso y, aparte, minifiguras o sets que se distingan.
4. Los sets **retirados** suelen revalorizarse: compruébalo en BrickEconomy.

### C.6 Preguntas clave al vendedor

- "¿Tienes el número del set o las instrucciones?"
- "¿Están todas las minifiguras? ¿Puedes hacer una foto de ellas?"
- "¿Todo es LEGO original o hay piezas de otras marcas?"
- "¿Cuánto pesa el lote?"

Fuentes: [Brick Resales – How to identify fake LEGO parts](https://brickresales.com.au/how-to-identify-fake-lego-parts/), [Brickset – Calculating the value of a bulk lot](https://brickset.com/article/54103/calculating-the-value-of-a-bulk-lot).

## Anexo D. Guía experta: videojuegos y consolas retro

### D.1 Región

- En España interesa **PAL**. En Game Boy Advance, el código del producto en la etiqueta debe terminar en una región europea (por ejemplo, **EUR** o el código de país); un código que termina en USA en un juego vendido como PAL es una señal de alarma.
- En Super Nintendo, el código del producto debe corresponder a la región.
- Usa siempre precios PAL en PriceCharting o vendidos de eBay Europa.

### D.2 Original o falso

**Game Boy y Game Boy Color**
- En la parte de arriba del cartucho debe poner "Nintendo Game Boy".
- Color de la carcasa correcto para ese juego (por ejemplo, Pokémon Oro es dorado).
- Etiqueta comparada con una original conocida.

**Game Boy Advance** (los Pokémon son los más falsificados)
- La etiqueta debe tener logo del juego, logo de Nintendo, sello de calidad, símbolo de clasificación por edades y código del producto. Si falta alguno, probablemente es falso.
- Las etiquetas originales llevan un **número estampado** (en relieve) que se ve con luz rasante.
- Brillo y acabado de la etiqueta: las falsas suelen ser más mates o tener el brillo distinto.
- **Pokémon Rojo Fuego y Verde Hoja:** en el reverso de la placa, las originales tienen **cuatro rectángulos dorados** a la izquierda; las falsas, círculos dorados brillantes.
- Placa con una pegatina numerada o marcas de tinta (como "E4"): no es original.
- Una pila en un juego que no debería llevarla es sospechoso.

**Super Nintendo**
- Detrás: etiqueta de seguridad y logo de Nintendo en relieve en el plástico.
- **Tornillos metálicos de seguridad.** Tornillos que parecen de plástico o una carcasa que se abre a mano: falso.
- La placa lleva "Nintendo", el año y un código de serie (se puede comprobar en SNES Central). Ojo con placas de juegos baratos cambiadas a carcasas de juegos caros.

**En general:** anuncios de "nuevo" para juegos de hace décadas, o "reproducción", indican copias.

### D.3 Estado y completitud

- **Suelto, completo en caja (caja + manual + bandeja) o precintado:** el precio cambia muchísimo. Las cajas de cartón (Game Boy, SNES, N64) en buen estado suben mucho el valor.
- La **pila de guardado agotada** en juegos de Game Boy y Game Boy Color no indica que sea falso; se puede cambiar, pero resta algo de valor.
- Consolas: pregunta si funcionan y si se han probado hace poco.

### D.4 Preguntas clave al vendedor

- "¿Puedes hacer una foto de la parte de atrás del cartucho y de la etiqueta con luz de lado?"
- "¿Tiene caja, manual y bandeja?"
- "¿Lo has probado? ¿Guarda partidas?"

Fuentes: [Nintendo Life – How to spot fake Nintendo video games](https://www.nintendolife.com/guides/how-to-spot-fake-nintendo-video-games).


## Anexo E. Libros a vigilar

No es una categoría de compra habitual: es una **lista de vigilancia** de libros que aparecen de vez en cuando en España, tienen valor demostrado y se reconocen por título, editorial y año. Si aparece uno, sobre todo dentro de un lote o una biblioteca heredada, avisa claramente.

| Libro | Lo que tiene que poner | Precio pedido orientativo (Iberlibro, octubre 2026) |
| --- | --- | --- |
| Cien años de soledad (García Márquez) | Sudamericana, Buenos Aires, 1967. La 1.ª impresión (8.000 ejemplares, impresa el 30 de mayo de 1967) no lleva la portada de Vicente Rojo; hubo 8 impresiones en 1967, así que el año solo no basta | 4.150–11.500 € sin firmar; más de 35.000 € firmado |
| Rayuela (Cortázar) | Sudamericana, Buenos Aires, 1963 | 2.100–3.200 € |
| La sombra del viento (Ruiz Zafón) | Planeta, Barcelona, 2001, primera edición, rústica, 575 páginas | ~900 € (un solo anuncio) |
| La familia de Pascual Duarte (Cela) | Aldecoa, Madrid, 1942 | 650–700 € |
| La colmena (Cela) | Emecé, Buenos Aires, 1951 | 90–280 € |
| Cinco horas con Mario (Delibes) | Destino, Barcelona, 1966 | 60–75 € |
| Primer romancero gitano (García Lorca) | Revista de Occidente, Madrid, 1928; título completo "Primer romancero gitano 1924-1927" | 5.500–8.000 € |
| Platero y yo (Juan Ramón Jiménez) | La Lectura, Madrid, 1914 (primera edición, colección "Biblioteca Juventud") | ~8.800 € firmado (un solo anuncio); sin firmar, bastante menos |
| Ficciones (Borges) | Sur, Buenos Aires, 1944 | 3.000–4.400 € |
| La ciudad y los perros (Vargas Llosa) | Seix Barral, Barcelona, 1963 (colección Biblioteca Breve) | 620–1.700 € |
| Harry Potter and the Philosopher's Stone (inglés) | Bloomsbury 1997; línea "10 9 8 7 6 5 4 3 2 1" y autora "Joanne Rowling"; solo 500 ejemplares | 40.000–55.000 $ |
| Harry Potter and the Sorcerer's Stone (EE. UU.) | Scholastic 1998, "First American edition, October 1998" | 4.000–6.500 $ |
| Harry Potter and the Prisoner of Azkaban (inglés) | 1999, con el error "Joanne Rowling" en la página de créditos | 1.500–12.000 $ |

- **No confundir:** Harry Potter y la piedra filosofal de **Salamandra (1999)** en español casi no tiene valor (ejemplares a 3–9 €).
- **Comprobados sin valor relevante (no vigilar):** Tiempo de silencio (Seix Barral 1962), La casa de los espíritus (1982), Nada (Destino 1945), El Principito (Emecé 1951), El Señor de los Anillos (Minotauro 1977) y Juego de tronos (Gigamesh 2002): en octubre de 2026 solo había ejemplares baratos o ninguno.
- **Confirmación:** la edición se confirma con la foto de la **página de créditos o el colofón**. Sin ella, márcalo como "posible" y pide la foto antes de comprar. Las primeras ediciones antiguas suelen ser rústicas y estar gastadas: el aspecto no descarta nada.
- **Valoración:** los precios de la tabla son pedidos por libreros, no ventas cerradas. Para decidir, usa el extremo bajo y busca vendidos en todocoleccion o eBay.
- **Venta:** todocoleccion, Iberlibro (como librero) o casas de subastas para los más caros.

Fuentes: [Iberlibro – búsquedas de primeras ediciones (octubre 2026)](https://www.iberlibro.com/buscar-libro/titulo/cien-anos-soledad/autor/gabriel-garcia-marquez/kw/sudamericana-1967/primera-edicion/), [T13 – Curiosidades de las ediciones de Cien años de soledad](https://www.t13.cl/noticia/tendencias/12-curiosidades-de-las-mas-de-100-ediciones-de-cien-anos-de-soledad-el-clasico-de-gabriel-garcia-marquez-que-cumple-50-anos), [Iberlibro – Guía para coleccionar libros de Harry Potter](https://www.iberlibro.com/libros-antiguos-raros-coleccion/guia-para-coleccionar-libros-de-harry-potter).
`;
