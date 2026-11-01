package com.auramatch.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AuraNativeBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
