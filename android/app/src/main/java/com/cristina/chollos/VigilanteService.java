package com.cristina.chollos;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
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
    /** Canal aparte para los chollazos: sonido de alarma, vibración larga y luz roja. Se puede silenciar por separado. */
    static final String CANAL_CHOLLAZO = "chollos_chollazos";
    private static final long[] VIBRACION_CHOLLAZO = {0, 600, 200, 600, 200, 1200};
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
                FiltroGemini.Resultado r = FiltroGemini.evaluar(
                    apiKey, VigilanteStore.modelo(ctx), app, titulo, cuerpo, VigilanteStore.notas(ctx));
                aviso.put("nota", r.nota);
                aviso.put("motivo", r.motivo);
                aviso.put("multiplo", r.multiplo == null ? JSONObject.NULL : r.multiplo);
                aviso.put("chollazo", r.chollazo);
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

        String multiplo = r.multiplo != null ? String.format(Locale.ROOT, " ×%.1f", r.multiplo) : "";
        String cabecera = r.chollazo
            ? "\uD83D\uDD25 ¡CHOLLAZO!" + multiplo + " · " + app
            : r.nota + multiplo + " · " + app;
        NotificationCompat.Builder aviso = new NotificationCompat.Builder(ctx, r.chollazo ? CANAL_CHOLLAZO : CANAL)
            .setSmallIcon(R.drawable.ic_notificacion)
            .setColor(Color.rgb(14, 90, 110))
            .setContentTitle(cabecera)
            .setContentText(titulo)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(titulo + "\n" + r.motivo))
            .setPriority(r.chollazo ? NotificationCompat.PRIORITY_MAX : NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendiente);
        if (r.chollazo) {
            // Para Android 7 y anteriores (sin canales) y para pintar el aviso de rojo.
            aviso.setColor(Color.rgb(224, 0, 42))
                .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
                .setVibrate(VIBRACION_CHOLLAZO)
                .setSound(sonidoChollazo())
                .setLights(Color.RED, 500, 500);
        }

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
        NotificationManager gestor = ctx.getSystemService(NotificationManager.class);
        gestor.createNotificationChannel(canal);

        NotificationChannel chollazo = new NotificationChannel(CANAL_CHOLLAZO, "¡Chollazos!", NotificationManager.IMPORTANCE_HIGH);
        chollazo.setDescription("Solo los chollos excepcionales: suena fuerte y vibra largo");
        chollazo.enableVibration(true);
        chollazo.setVibrationPattern(VIBRACION_CHOLLAZO);
        chollazo.enableLights(true);
        chollazo.setLightColor(Color.RED);
        chollazo.setSound(sonidoChollazo(), new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build());
        gestor.createNotificationChannel(chollazo);
    }

    /** Sonido de alarma del móvil (más llamativo que el de notificación); si no hay, el de notificación. */
    private static Uri sonidoChollazo() {
        Uri alarma = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        return alarma != null ? alarma : RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
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
