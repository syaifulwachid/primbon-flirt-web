package com.auramatch.app;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Pengelola Whitelist Target Obrolan (Privacy & Filter Engine).
 * Mendukung 2 mode:
 * 1. Mode Whitelist (Default): HANYA memantau nama kontak tertentu yang dimasukkan pengguna.
 * 2. Mode Pantau Chat Aktif: Membaca chat siapapun yang sedang dibuka pengguna di layar WhatsApp.
 */
public class TargetWhitelistManager {

    private static final String PREF_NAME = "AuraMatchWhitelist";
    private static final String KEY_TARGETS = "whitelisted_targets";
    private static final String KEY_MONITOR_ALL = "monitor_all_chats";

    private static final Set<String> cachedTargets = Collections.synchronizedSet(new HashSet<>());
    private static boolean monitorAllChats = false;

    private static String lastDetectedContact = "-";
    private static String lastDetectedMessage = "-";
    private static long lastDetectedTimestamp = 0;
    private static boolean lastFilterPassed = false;

    public static void init(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        Set<String> saved = prefs.getStringSet(KEY_TARGETS, null);
        if (saved != null) {
            cachedTargets.clear();
            cachedTargets.addAll(saved);
        }
        monitorAllChats = prefs.getBoolean(KEY_MONITOR_ALL, false);
    }

    public static void setTargets(Context context, List<String> names) {
        cachedTargets.clear();
        Set<String> toSave = new HashSet<>();
        if (names != null) {
            for (String n : names) {
                if (n != null && !n.trim().isEmpty()) {
                    String clean = n.trim().toLowerCase();
                    cachedTargets.add(clean);
                    toSave.add(clean);
                }
            }
        }
        if (context != null) {
            context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
                .edit()
                .putStringSet(KEY_TARGETS, toSave)
                .apply();
        }
    }

    public static void setMonitorAll(Context context, boolean allowAll) {
        monitorAllChats = allowAll;
        if (context != null) {
            context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_MONITOR_ALL, allowAll)
                .apply();
        }
    }

    public static boolean isMonitorAll() {
        return monitorAllChats;
    }

    public static void recordDetection(String contact, String message, boolean passed) {
        lastDetectedContact = (contact != null) ? contact : "-";
        lastDetectedMessage = (message != null) ? message : "-";
        lastDetectedTimestamp = System.currentTimeMillis();
        lastFilterPassed = passed;
    }

    public static String getLastContact() { return lastDetectedContact; }
    public static String getLastMessage() { return lastDetectedMessage; }
    public static long getLastTimestamp() { return lastDetectedTimestamp; }
    public static boolean getLastFilterPassed() { return lastFilterPassed; }

    /**
     * Memeriksa apakah kontak diizinkan untuk diproses.
     */
    public static boolean isTarget(Context context, String contactName) {
        if (contactName == null || contactName.trim().isEmpty()) {
            recordDetection(contactName, null, false);
            return false;
        }

        if (cachedTargets.isEmpty() && context != null) {
            init(context);
        }

        // 1. Abaikan format grup WhatsApp jika ada tanda ":"
        if (contactName.contains(":")) {
            recordDetection(contactName, "Format Grup", false);
            return false;
        }

        // 2. Jika Mode Pantau Chat Aktif dinyalakan oleh pengguna, izinkan semua chat non-grup
        if (monitorAllChats) {
            recordDetection(contactName, "Diizinkan (Mode Pantau Bebas)", true);
            return true;
        }

        // 3. Mode Whitelist: Cocokkan dengan nama target yang terdaftar
        String lower = contactName.trim().toLowerCase();
        for (String target : cachedTargets) {
            if (lower.contains(target) || target.contains(lower)) {
                recordDetection(contactName, "Cocok dengan target: " + target, true);
                return true;
            }
        }

        recordDetection(contactName, "Bukan Target CRM (Diabaikan)", false);
        return false;
    }

    public static Set<String> getActiveTargets() {
        return new HashSet<>(cachedTargets);
    }
}
