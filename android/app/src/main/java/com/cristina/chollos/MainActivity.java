package com.cristina.chollos;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registramos nuestro plugin propio antes de que arranque el puente de Capacitor.
        registerPlugin(VigilantePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
