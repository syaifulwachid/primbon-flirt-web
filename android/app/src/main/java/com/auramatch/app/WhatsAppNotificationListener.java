package com.auramatch.app;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

/**
 * Service untuk memantau notifikasi masuk dari WhatsApp secara real-time.
 * Menangkap nama pengirim dan teks pesan tanpa memerlukan koneksi WhatsApp Web / scan QR.
 */
public class WhatsAppNotificationListener extends NotificationListenerService {

    private static final String TAG = "AuraMatchWA";
    private static final String WHATSAPP_PACKAGE = "com.whatsapp";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (!WHATSAPP_PACKAGE.equals(sbn.getPackageName())) {
            return;
        }

        Notification notification = sbn.getNotification();
        if (notification == null) return;

        Bundle extras = notification.extras;
        if (extras == null) return;

        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence textChar = extras.getCharSequence(Notification.EXTRA_TEXT);
        String text = (textChar != null) ? textChar.toString() : "";

        // Abaikan notifikasi sistem umum atau pesan kosong
        if (title == null || text.isEmpty() || title.contains("WhatsApp") || title.contains("backup")) {
            return;
        }

        Log.d(TAG, "Notifikasi WhatsApp Masuk: Dari [" + title + "]: " + text);

        // Kirim event langsung ke internal EventBus agar Webview Capacitor terupdate real-time
        WhatsAppMessageEventBus.postMessage(title, text, "target", System.currentTimeMillis());

        // Simpan juga ke SharedPreferences sebagai fallback persistensi
        getSharedPreferences("AuraMatchPrefs", MODE_PRIVATE)
            .edit()
            .putString("last_sender", title)
            .putString("last_text", text)
            .putLong("last_timestamp", System.currentTimeMillis())
            .apply();
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // Notification dismissed
    }
}
