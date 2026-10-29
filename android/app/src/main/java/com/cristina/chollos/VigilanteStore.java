package com.cristina.chollos;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Almacén compartido entre el servicio (que funciona con la app cerrada) y el plugin:
 * configuración, avisos detectados y huellas de notificaciones ya vistas.
 */
final class VigilanteStore {

    private static final String PREFS = "chollos_vigilante";
    private static final String CLAVE_AVISOS = "avisos";
    private static final String CLAVE_VISTOS = "vistos";
    private static final int MAX_AVISOS = 100;
    private static final int MAX_VISTOS = 300;

    private VigilanteStore() {}

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static void configurar(Context ctx, String apiKey, String modelo, boolean activo) {
        prefs(ctx).edit()
            .putString("apiKey", apiKey)
            .putString("modelo", modelo)
            .putBoolean("activo", activo)
            .apply();
    }

    static String apiKey(Context ctx) {
        return prefs(ctx).getString("apiKey", "");
    }

    static String modelo(Context ctx) {
        return prefs(ctx).getString("modelo", "gemini-2.5-flash-lite");
    }

    static boolean activo(Context ctx) {
        return prefs(ctx).getBoolean("activo", false);
    }

    /** Devuelve true si es la primera vez que vemos esta huella (y la memoriza). */
    static synchronized boolean marcarVisto(Context ctx, String huella) {
        try {
            JSONArray vistos = new JSONArray(prefs(ctx).getString(CLAVE_VISTOS, "[]"));
            for (int i = 0; i < vistos.length(); i++) {
                if (huella.equals(vistos.optString(i))) return false;
            }
            JSONArray nuevo = new JSONArray();
            nuevo.put(huella);
            for (int i = 0; i < vistos.length() && nuevo.length() < MAX_VISTOS; i++) {
                nuevo.put(vistos.optString(i));
            }
            prefs(ctx).edit().putString(CLAVE_VISTOS, nuevo.toString()).apply();
            return true;
        } catch (JSONException e) {
            return true;
        }
    }

    static synchronized JSONArray avisos(Context ctx) {
        try {
            return new JSONArray(prefs(ctx).getString(CLAVE_AVISOS, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    /** Guarda o actualiza un aviso (por id), el más reciente primero. */
    static synchronized void guardarAviso(Context ctx, JSONObject aviso) {
        JSONArray actuales = avisos(ctx);
        JSONArray nuevo = new JSONArray();
        nuevo.put(aviso);
        String id = aviso.optString("id");
        for (int i = 0; i < actuales.length() && nuevo.length() < MAX_AVISOS; i++) {
            JSONObject a = actuales.optJSONObject(i);
            if (a != null && !id.equals(a.optString("id"))) nuevo.put(a);
        }
        prefs(ctx).edit().putString(CLAVE_AVISOS, nuevo.toString()).apply();
    }

    static synchronized void borrarAvisos(Context ctx) {
        prefs(ctx).edit().putString(CLAVE_AVISOS, "[]").apply();
    }
}
