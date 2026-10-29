package com.cristina.chollos;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Filtro rápido: con solo el texto de la notificación (título, precio, descripción corta)
 * decide si merece la pena mirar el anuncio. No ve fotos ni busca precios: eso se hace
 * después en la app con "Evaluar a fondo".
 */
final class FiltroGemini {

    private static final String URL_API = "https://generativelanguage.googleapis.com/v1beta/models/";

    private static final String INSTRUCCIONES =
        "Eres un filtro rápido para alguien que compra artículos de segunda mano en Vinted o Wallapop para revenderlos. "
        + "Solo ves el texto de una notificación (título, a veces precio y poco más), sin fotos.\n"
        + "Categorías que le interesan: LEGO (sets descatalogados, minifiguras, lotes), videojuegos y consolas retro (PAL, completos en caja), "
        + "vajillas de marca (Sargadelos, Pickman, Vista Alegre, Limoges, Rosenthal, Royal Copenhagen, Herend, Arabia, Iittala, Rörstrand), "
        + "cuberterías de plata de ley (916, 925; marcas como Georg Jensen, Puiforcat, Tiffany, Robbe & Berking, Espuñes, Pedro Durán) "
        + "o plateado de marca (Christofle, Ercuis, WMF 90/100), menaje premium (Le Creuset, Staub, cobre Mauviel, Pyrex vintage), "
        + "cristalería firmada (Iittala, Holmegaard, Orrefors, Murano firmado, Duralex vintage), jarrones de cerámica firmados "
        + "(West Germany, nórdicos, Manises, Sargadelos) y juegos completos de herrajes antiguos de latón o bronce.\n"
        + "Libros a vigilar (avisa con nota alta si aparece alguno): Cien años de soledad de Sudamericana 1967, Rayuela de Sudamericana 1963, La sombra del viento de Planeta 2001 primera edición, La familia de Pascual Duarte de Aldecoa 1942, La colmena de Emecé 1951, Cinco horas con Mario de Destino 1966, Primer romancero gitano de Revista de Occidente 1928, Platero y yo de La Lectura 1914, Ficciones de Sur 1944, La ciudad y los perros de Seix Barral 1963, Harry Potter en inglés de Bloomsbury 1997 o Scholastic 1998. El Harry Potter de Salamandra no vale.\n"
        + "Plata: 925, 916, 915, 800 o estrella de cinco puntas. NO es plata: EPNS, silver plated, plateado, Mtl, alpaca, números 90/100/84 (baño), Meneses sin ley.\n"
        + "Descarta: metal plateado o 'silver plated' sin marca, réplicas o 'estilo antiguo', moda rápida, y aldabas, pomos de porcelana, "
        + "ganchos de hierro fundido, percheros de diseño, porcelana china 'antigua' y cerámica italiana sin etiqueta.\n"
        + "Estima a ojo el múltiplo = valor de reventa conservador / precio pedido. Notas: CHOLLO (múltiplo >= 3), BUENO (2 a 3), "
        + "NEGOCIABLE (1,3 a 2, o interesante pero con datos insuficientes), DESCARTADO (< 1,3 o fuera de las categorías). "
        + "Si no hay precio pero el artículo es de una categoría interesante, usa NEGOCIABLE para que lo revise.\n"
        + "\"chollazo\" es true solo si la nota es CHOLLO y es excepcional: múltiplo de 5 o más, un libro de la lista o una pieza rara clarísima.\n"
        + "Responde SOLO con JSON: {\"nota\": \"CHOLLO|BUENO|NEGOCIABLE|DESCARTADO\", \"motivo\": \"máximo 12 palabras\", \"multiplo\": número o null, \"chollazo\": true o false}";

    static final class Resultado {
        final String nota;
        final String motivo;
        final Double multiplo;
        /** Mismo criterio que src/app/chollazo.ts: CHOLLO y (marcado por la IA o múltiplo >= 5). */
        final boolean chollazo;

        Resultado(String nota, String motivo, Double multiplo, boolean marcado) {
            this.nota = nota;
            this.motivo = motivo;
            this.multiplo = multiplo;
            this.chollazo = "CHOLLO".equals(nota) && (marcado || (multiplo != null && multiplo >= 5));
        }
    }

    private FiltroGemini() {}

    /** Llamada bloqueante: ejecutar siempre fuera del hilo principal. */
    static Resultado evaluar(String apiKey, String modelo, String app, String titulo, String texto, String notas) throws Exception {
        String instrucciones = notas == null || notas.trim().isEmpty()
            ? INSTRUCCIONES
            : INSTRUCCIONES + "\nLo que sabe la usuaria (tiene prioridad sobre lo anterior):\n" + notas.trim() + "\n";
        JSONObject cuerpo = new JSONObject();
        cuerpo.put("systemInstruction", new JSONObject()
            .put("parts", new JSONArray().put(new JSONObject().put("text", instrucciones))));
        String mensaje = "Notificación de " + app + ".\nTítulo: " + titulo + "\nTexto: " + texto;
        cuerpo.put("contents", new JSONArray().put(new JSONObject()
            .put("role", "user")
            .put("parts", new JSONArray().put(new JSONObject().put("text", mensaje)))));
        cuerpo.put("generationConfig", new JSONObject()
            .put("temperature", 0.1)
            .put("responseMimeType", "application/json"));

        HttpURLConnection conexion = (HttpURLConnection) new URL(URL_API + modelo + ":generateContent").openConnection();
        conexion.setRequestMethod("POST");
        conexion.setConnectTimeout(15000);
        conexion.setReadTimeout(30000);
        conexion.setDoOutput(true);
        conexion.setRequestProperty("Content-Type", "application/json");
        conexion.setRequestProperty("x-goog-api-key", apiKey);
        try (OutputStream salida = conexion.getOutputStream()) {
            salida.write(cuerpo.toString().getBytes(StandardCharsets.UTF_8));
        }

        int codigo = conexion.getResponseCode();
        String respuesta = leer(codigo >= 400 ? conexion.getErrorStream() : conexion.getInputStream());
        conexion.disconnect();
        if (codigo >= 400) {
            throw new Exception("Gemini respondió " + codigo + ": " + respuesta);
        }

        JSONArray partes = new JSONObject(respuesta)
            .getJSONArray("candidates").getJSONObject(0)
            .getJSONObject("content").getJSONArray("parts");
        StringBuilder texto2 = new StringBuilder();
        for (int i = 0; i < partes.length(); i++) {
            texto2.append(partes.getJSONObject(i).optString("text", ""));
        }
        String bruto = texto2.toString();
        int inicio = bruto.indexOf('{');
        int fin = bruto.lastIndexOf('}');
        JSONObject json = new JSONObject(bruto.substring(inicio, fin + 1));

        Double multiplo = json.isNull("multiplo") ? null : json.optDouble("multiplo");
        if (multiplo != null && multiplo.isNaN()) multiplo = null;
        return new Resultado(
            json.optString("nota", "DESCARTADO").toUpperCase(),
            json.optString("motivo", ""),
            multiplo,
            json.optBoolean("chollazo", false)
        );
    }

    private static String leer(InputStream entrada) throws Exception {
        if (entrada == null) return "";
        StringBuilder sb = new StringBuilder();
        try (BufferedReader lector = new BufferedReader(new InputStreamReader(entrada, StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = lector.readLine()) != null) sb.append(linea);
        }
        return sb.toString();
    }
}
