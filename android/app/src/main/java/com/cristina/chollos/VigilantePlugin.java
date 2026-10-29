package com.cristina.chollos;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Puente entre la app (TypeScript, src/app/vigilante.ts) y el servicio nativo VigilanteService.
 */
@CapacitorPlugin(
    name = "Vigilante",
    permissions = { @Permission(alias = "avisos", strings = { Manifest.permission.POST_NOTIFICATIONS }) }
)
public class VigilantePlugin extends Plugin {

    /** Instancia viva (si la app está abierta) para avisar a la interfaz en tiempo real. */
    private static volatile VigilantePlugin instancia;

    @Override
    public void load() {
        instancia = this;
        VigilanteService.crearCanal(getContext());
    }

    static void emitirNuevoAviso(JSONObject aviso) {
        VigilantePlugin p = instancia;
        if (p == null) return;
        try {
            p.notifyListeners("nuevoAviso", JSObject.fromJSONObject(aviso));
        } catch (Exception ignorada) {
            // La interfaz recargará los avisos al volver.
        }
    }

    @PluginMethod
    public void configurar(PluginCall call) {
        VigilanteStore.configurar(
            getContext(),
            call.getString("apiKey", ""),
            call.getString("modelo", "gemini-2.5-flash-lite"),
            Boolean.TRUE.equals(call.getBoolean("activo", false)),
            call.getString("notas", "")
        );
        call.resolve();
    }

    @PluginMethod
    public void estado(PluginCall call) {
        JSObject r = new JSObject();
        r.put("permisoLectura", NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName()));
        r.put("permisoAvisos", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        r.put("activo", VigilanteStore.activo(getContext()));
        call.resolve(r);
    }

    /** Abre la pantalla de Android "Acceso a notificaciones" para que actives Chollos. */
    @PluginMethod
    public void abrirPermisoLectura(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void pedirPermisoAvisos(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("avisos") == PermissionState.GRANTED) {
            JSObject r = new JSObject();
            r.put("concedido", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
            call.resolve(r);
            return;
        }
        requestPermissionForAlias("avisos", call, "respuestaPermisoAvisos");
    }

    @PermissionCallback
    private void respuestaPermisoAvisos(PluginCall call) {
        JSObject r = new JSObject();
        r.put("concedido", getPermissionState("avisos") == PermissionState.GRANTED);
        call.resolve(r);
    }

    @PluginMethod
    public void obtenerAvisos(PluginCall call) {
        JSONArray avisos = VigilanteStore.avisos(getContext());
        JSArray lista = new JSArray();
        for (int i = 0; i < avisos.length(); i++) {
            JSONObject a = avisos.optJSONObject(i);
            if (a != null) lista.put(a);
        }
        JSObject r = new JSObject();
        r.put("avisos", lista);
        call.resolve(r);
    }

    @PluginMethod
    public void borrarAvisos(PluginCall call) {
        VigilanteStore.borrarAvisos(getContext());
        call.resolve();
    }

    /** Si la app se abrió pulsando uno de nuestros avisos, devuelve su id (una sola vez). */
    @PluginMethod
    public void avisoPendiente(PluginCall call) {
        JSObject r = new JSObject();
        Intent intent = getActivity() != null ? getActivity().getIntent() : null;
        String id = intent != null ? intent.getStringExtra(VigilanteService.EXTRA_AVISO) : null;
        if (intent != null) intent.removeExtra(VigilanteService.EXTRA_AVISO);
        r.put("id", id);
        call.resolve(r);
    }

    /** La app ya estaba abierta y se ha pulsado un aviso. */
    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        String id = intent.getStringExtra(VigilanteService.EXTRA_AVISO);
        if (id != null) {
            JSObject datos = new JSObject();
            datos.put("id", id);
            notifyListeners("avisoAbierto", datos);
        }
    }
}
