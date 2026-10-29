# Chollos · versión 1.4

App en Angular + Ionic + Capacitor que evalúa anuncios de segunda mano con la API de Gemini, usando los criterios de la skill *evaluar-anuncio-segunda-mano*.

## Qué hace

| Pantalla | Para qué |
| --- | --- |
| **Evaluar** | Subes capturas y/o texto de un anuncio y te da nota de chollo, múltiplo, beneficio, piezas, riesgos y preguntas al vendedor |
| **Cola** | Preparas varios anuncios con "A la cola" y los evalúa todos seguidos, ordenados de mejor a peor |
| **Avisos** (solo Android) | Lee las notificaciones de tus búsquedas guardadas de Vinted y Wallapop, las filtra con Gemini aunque la app esté cerrada y solo te avisa de lo que parece un chollo |
| **Cartera** | Lo que has comprado: en stock, guardado como inversión y vendido, con invertido, ganancia latente, beneficio real, €/hora y días hasta vender. "Lo he comprado" en una evaluación lo añade aquí. Exporta a CSV. Avisa de lo que lleva más de 60 días sin venderse. En cada artículo, **Redactar anuncio de venta** prepara título, descripción, precio de salida y mínimo, canal, palabras clave y consejos de fotos, listos para copiar |
| **Historial** | Últimas 50 evaluaciones |

En cada pieza valorada hay botones **Ver vendidos** (eBay, todocoleccion, Wallapop) para comprobar precios reales. En **Avisos** tienes **búsquedas recomendadas** por categoría que se abren en Vinted o Wallapop para guardarlas.

En **Ajustes** puedes **exportar e importar una copia de seguridad** (cartera, historial y ajustes, sin la clave). También hay un **modo demostración** (respuestas de ejemplo, sin Gemini) para probar toda la app sin clave, y un botón **Probar clave**.

Además, en Android la app aparece en el menú **Compartir**: desde Vinted compartes el anuncio (enlace) y desde la galería las capturas, y llegan directamente al formulario.

## Compilación automática con GitHub (sin instalar nada)

Cada vez que subes cambios a la rama `main`, GitHub Actions:

- **Compila el APK de Android** y lo publica en la Release **"ultima-version"** del repositorio. Desde el móvil, entra en `github.com/<usuario>/chollo/releases`, descarga `chollos.apk` e instálalo (Android pedirá permitir instalar apps de Chrome la primera vez). Las siguientes versiones se instalan encima sin perder los datos.
- **Publica la web** en GitHub Pages: `https://<usuario>.github.io/chollo/`. Hay que activarlo una vez en *Settings → Pages → Source: GitHub Actions*.

Si una compilación falla, aparece una cruz roja en la pestaña **Actions**. Abre el paso que falla y copia el error.

La firma de los APK de prueba (`android/app/chollos-debug.keystore`, contraseña `android`) está en el repositorio a propósito, para que todas las versiones se puedan instalar unas encima de otras. Sirve solo para uso personal, no para publicar en Google Play.

## Arrancar en el ordenador (versión web)

```
npm install
npm start
```

Abre http://localhost:4200, pulsa el engranaje y pega tu clave de Gemini (gratis en https://aistudio.google.com/apikey). En la web funciona todo menos Compartir y Avisos.

## Instalar en el móvil Android

Necesitas Android Studio (incluye el SDK y Java).

1. `npm install`
2. `npm run android` (compila la web, la copia al proyecto Android y abre Android Studio).
3. En el móvil: Ajustes → Información del teléfono → pulsa 7 veces "Número de compilación" → en Opciones de desarrollador activa **Depuración USB**.
4. Conecta el móvil por USB y pulsa **Run ▶** en Android Studio.
5. Para tener un instalador: *Build → Generate App Bundles or APKs → Generate APKs*. El APK queda en `android/app/build/outputs/apk/debug/`.

Cada vez que cambies el código web: `npm run android` y Run otra vez.

### Primera vez en el móvil

1. Ajustes (engranaje): pega la clave de Gemini y guarda.
2. Pestaña **Avisos**: activa "Vigilar Vinted y Wallapop", pulsa **Dar permiso** en "leer notificaciones" (activa Chollos en la lista de Android) y en "avisarte".
3. Ajustes de Android → Apps → Chollos → Batería → **Sin restricciones**, para que el vigilante funcione todo el día.
4. En Vinted y Wallapop, crea búsquedas guardadas con las notificaciones activadas.

## Cómo está hecho

| Archivo | Qué hace |
| --- | --- |
| `src/app/skill-prompt.ts` | Instrucciones de la skill. Si cambias la skill, pega aquí el nuevo texto |
| `src/app/gemini.service.ts` | Evaluación completa: instrucciones + texto + fotos, búsqueda de Google para precios, respuesta en JSON |
| `src/app/cola.service.ts` | Cola de anuncios y evaluación en serie |
| `src/app/compartir.ts` | Recibe lo compartido desde otras apps (plugin @capgo/capacitor-share-target) |
| `src/app/vigilante.ts` | Puente TypeScript con el plugin nativo Vigilante |
| `src/app/resultado.component.ts` | Tarjeta de resultado reutilizable |
| `src/app/cartera.component.ts` / `cartera.service.ts` | Pestaña Cartera, cálculo de cifras y exportación CSV |
| `src/app/almacen.ts` | Guarda historial y cartera en IndexedDB (migra lo que hubiera en localStorage) |
| `src/app/demo.ts` | Respuestas de ejemplo del modo demostración |
| `src/app/enlaces.ts` | Enlaces a vendidos (eBay, todocoleccion, Wallapop) y búsquedas recomendadas |
| `src/app/exportar.ts` | Exportar archivos: menú Compartir en Android, descarga en el navegador |
| `android/app/src/main/java/com/cristina/chollos/VigilanteService.java` | Servicio Android que escucha las notificaciones de Vinted (`fr.vinted`) y Wallapop (`com.wallapop`) |
| `android/.../FiltroGemini.java` | Filtro rápido con Gemini (solo texto) que decide si avisar |
| `android/.../VigilantePlugin.java` | Plugin de Capacitor: configuración, permisos y lista de avisos |
| `android/.../VigilanteStore.java` | Guarda configuración y avisos en el móvil |

## Pendiente de comprobar en el móvil

- El código Android no se ha podido compilar en el entorno donde se generó: la primera compilación en Android Studio puede pedir algún ajuste menor.
- Qué información trae exactamente la notificación de Vinted. Si solo dice "hay artículos nuevos", el filtro tendrá poco con qué decidir.
- Si los nombres de paquete de Vinted o Wallapop fueran otros, se cambian en `VigilanteService.java`.

## Notas

- La clave de la API va dentro de la app: válido solo para uso personal.
- Mientras no actives la facturación en Google AI Studio, usas la capa gratuita y no hay cobros.
