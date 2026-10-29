package com.cristina.chollos;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONObject;

/**
 * Android avisa a este servicio de cada notificación que llega al móvil (con el permiso
 * "Acceso a notificaciones"). Nos quedamos solo con las de Vinted y Wallapop, las pasamos
 * por el filtro rápido de Gemini y, si parecen un chollo, lanzamos nuestro propio aviso.
 * Funciona aunque la app esté cerrada.
 */
public class VigilanteService extends NotificationListenerService {

    private static final String TAG = "ChollosVigilante";
    static final String CANAL = "chollos_avisos";
    static final String EXTRA_AVISO = "avisoId";

    /** Paquetes de las apps que vigilamos y el nombre que mostramos. */
    private static final Map<String, String> APPS = new HashMap<>();

    static {
        APPS.put("fr.vinted", "Vinted");
        APPS.put("com.wallapop", "Wallapop");
    }

    private final ExecutorService hilo = Executors.newSingleThreadExecutor();

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String app = APPS.get(sbn.getPackageName());
        if (app == null) return;
        Context ctx = getApplicationContext();
        if (!VigilanteStore.activo(ctx)) return;

        Notification n = sbn.getNotification();
        // El "resumen" de un grupo de notificaciones no trae información útil.
        if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;

        Bundle extras = n.extras;
        String titulo = texto(extras.getCharSequence(Notification.EXTRA_TITLE));
        String cuerpo = texto(extras.getCharSequence(Notification.EXTRA_BIG_TEXT));
        if (cuerpo.isEmpty()) cuerpo = texto(extras.getCharSequence(Notification.EXTRA_TEXT));
        CharSequence[] lineas = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
        if (lineas != null && lineas.length > 0) {
            StringBuilder sb = new StringBuilder(cuerpo);
            for (CharSequence l : lineas) sb.append('\n').append(l);
            cuerpo = sb.toString().trim();
        }
        if (titulo.isEmpty() && cuerpo.isEmpty()) return;

        // Evitamos procesar dos veces la misma notificación (Android a veces la reenvía al actualizarla).
        String huella = sbn.getPackageName() + "|" + (titulo + "|" + cuerpo).hashCode();
        if (!VigilanteStore.marcarVisto(ctx, huella)) return;

        final String fTitulo = titulo;
        final String fCuerpo = cuerpo;
        hilo.execute(() -> procesar(ctx, app, fTitulo, fCuerpo));
    }

    private void procesar(Context ctx, String app, String titulo, String cuerpo) {
        JSONObject aviso = new JSONObject();
        String id = UUID.randomUUID().toString();
        try {
            aviso.put("id", id);
            aviso.put("fecha", System.currentTimeMillis());
            aviso.put("app", app);
            aviso.put("titulo", titulo);
            aviso.put("texto", cuerpo);
            aviso.put("nota", JSONObject.NULL);
            aviso.put("motivo", "");
            aviso.put("multiplo", JSONObject.NULL);

            String apiKey = VigilanteStore.apiKey(ctx);
            if (apiKey.isEmpty()) {
                aviso.put("motivo", "Falta la clave de Gemini");
            } else {
                FiltroGemini.Resultado r = FiltroGemini.evaluar(apiKey, VigilanteStore.modelo(ctx), app, titulo, cuerpo);
                aviso.put("nota", r.nota);
                aviso.put("motivo", r.motivo);
                aviso.put("multiplo", r.multiplo == null ? JSONObject.NULL : r.multiplo);
                if (!"DESCARTADO".equals(r.nota)) {
                    notificar(ctx, id, app, titulo, r);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "No se pudo evaluar la notificación", e);
            try {
                aviso.put("motivo", "Error al evaluar: " + e.getMessage());
            } catch (Exception ignorada) {
                // nada
            }
        }
        VigilanteStore.guardarAviso(ctx, aviso);
        VigilantePlugin.emitirNuevoAviso(aviso);
    }

    private void notificar(Context ctx, String id, String app, String titulo, FiltroGemini.Resultado r) {
        if (Build.VERSION.SDK_INT >= 33
            && ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        crearCanal(ctx);

        Intent abrir = new Intent(ctx, MainActivity.class);
        abrir.putExtra(EXTRA_AVISO, id);
        abrir.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendiente = PendingIntent.getActivity(
            ctx, id.hashCode(), abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String cabecera = r.nota + (r.multiplo != null ? String.format(Locale.ROOT, " ×%.1f", r.multiplo) : "") + " · " + app;
        NotificationCompat.Builder aviso = new NotificationCompat.Builder(ctx, CANAL)
            .setSmallIcon(getApplicationInfo().icon)
            .setContentTitle(cabecera)
            .setContentText(titulo)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(titulo + "\n" + r.motivo))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendiente);

        try {
            NotificationManagerCompat.from(ctx).notify(id.hashCode(), aviso.build());
        } catch (SecurityException e) {
            Log.w(TAG, "Sin permiso para mostrar avisos", e);
        }
    }

    static void crearCanal(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel canal = new NotificationChannel(CANAL, "Posibles chollos", NotificationManager.IMPORTANCE_HIGH);
        canal.setDescription("Anuncios de Vinted y Wallapop que parecen un buen negocio");
        ctx.getSystemService(NotificationManager.class).createNotificationChannel(canal);
    }

    private static String texto(CharSequence cs) {
        return cs == null ? "" : cs.toString().trim();
    }

    @Override
    public void onDestroy() {
        hilo.shutdown();
        super.onDestroy();
    }
}
