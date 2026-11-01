package com.auramatch.app;

import java.util.ArrayList;
import java.util.List;

/**
 * Event Bus internal sederhana untuk menghubungkan Native Service WhatsApp
 * dengan Webview Capacitor AuraMatch.
 */
public class WhatsAppMessageEventBus {

    public interface OnChatMessageListener {
        void onMessageReceived(String sender, String text, String role, long timestamp);
    }

    private static final List<OnChatMessageListener> listeners = new ArrayList<>();

    public static synchronized void registerListener(OnChatMessageListener listener) {
        if (!listeners.contains(listener)) {
            listeners.add(listener);
        }
    }

    public static synchronized void unregisterListener(OnChatMessageListener listener) {
        listeners.remove(listener);
    }

    public static synchronized void postMessage(String sender, String text, String role, long timestamp) {
        for (OnChatMessageListener listener : listeners) {
            try {
                listener.onMessageReceived(sender, text, role, timestamp);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
