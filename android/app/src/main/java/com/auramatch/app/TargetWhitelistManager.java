package com.auramatch.app;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Pengelola Whitelist Target Obrolan (Privacy & Filter Engine).
 * Memastikan HANYA nama kontak yang didaftarkan sebagai gebetan di CRM
 * yang boleh dibaca notifikasinya atau dipindai percakapannya.
 * Semua obrolan lainnya (keluarga, grup kantor, bank, dll) diabaikan total!
 */
public class TargetWhitelistManager {

    private static final String PREF_NAME = "AuraMatchWhitelist";
    private static final String KEY_TARGETS = "whitelisted_targets";
    private static final Set<String> cachedTargets = Collections.synchronizedSet(new HashSet<>());

    public static void init(Context context) {
        if (context == null) return;
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        Set<String> saved = prefs.getStringSet(KEY_TARGETS, null);
        if (saved != null) {
            cachedTargets.clear();
            cachedTargets.addAll(saved);
        }
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

    /**
     * Memeriksa apakah kontak masuk ke dalam daftar whitelist target gebetan.
     */
    public static boolean isTarget(Context context, String contactName) {
        if (contactName == null || contactName.trim().isEmpty()) {
            return false;
        }

        if (cachedTargets.isEmpty() && context != null) {
            init(context);
        }

        // Jika user belum mendaftarkan target apapun, jangan baca obrolan apapun demi keamanan
        if (cachedTargets.isEmpty()) {
            return false;
        }

        String lower = contactName.trim().toLowerCase();

        // 1. Abaikan format grup WhatsApp (biasanya ada tanda ":")
        if (contactName.contains(":")) {
            return false;
        }

        // 2. Cocokkan dengan nama target yang terdaftar
        for (String target : cachedTargets) {
            if (lower.contains(target) || target.contains(lower)) {
                return true;
            }
        }

        return false;
    }

    public static Set<String> getActiveTargets() {
        return new HashSet<>(cachedTargets);
    }
}
