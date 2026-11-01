package com.auramatch.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Accessibility Service untuk membaca percakapan WhatsApp dua arah
 * (Pesan Masuk dari Gebetan DAN Pesan Keluar dari Pengguna).
 * 
 * Bekerja langsung di atas layar chat WhatsApp aktif untuk mendapatkan
 * konteks utuh (Full Two-Way Thread Context) tanpa perlu copy-paste,
 * serta menampilkan Gelembung Melayang (Floating Wingman) secara otomatis.
 */
public class WhatsAppAccessibilityReaderService extends AccessibilityService {

    private static final String TAG = "AuraMatchAccessibility";
    private static final Set<String> processedMessages = new HashSet<>();
    private static String activeChatTitle = "Target";
    private boolean isWhatsAppActive = false;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;

        CharSequence packageNameChar = event.getPackageName();
        if (packageNameChar == null) return;
        String packageName = packageNameChar.toString();

        boolean isWA = packageName.contains("whatsapp");

        if (isWA) {
            if (!isWhatsAppActive) {
                isWhatsAppActive = true;
                showFloatingBubble();
            }

            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode == null) return;

            try {
                // 1. Ekstrak nama kontak aktif dari header WhatsApp jika ada
                extractActiveContactName(rootNode);

                // FILTER PRIVASI KETAT:
                // HANYA pindai gelembung chat jika ruang obrolan yang dibuka adalah target CRM!
                // Obrolan pribadi lain (teman, keluarga, grup kantor) diabaikan total.
                if (!TargetWhitelistManager.isTarget(this, activeChatTitle)) {
                    return;
                }

                // 2. Baca seluruh gelembung percakapan di layar
                scanChatMessages(rootNode);
            } catch (Exception e) {
                Log.e(TAG, "Error saat membaca chat: " + e.getMessage());
            } finally {
                rootNode.recycle();
            }
        }
    }

    private void showFloatingBubble() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Izin overlay (canDrawOverlays) belum diberikan.");
            return;
        }

        try {
            Intent intent = new Intent(this, FloatingWingmanService.class);
            intent.setAction(FloatingWingmanService.ACTION_SHOW);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
            Log.d(TAG, "Gelembung melayang otomatis diaktifkan saat WhatsApp dibuka.");
        } catch (Exception e) {
            Log.e(TAG, "Gagal menjalankan FloatingWingmanService dari AccessibilityService: " + e.getMessage());
        }
    }

    private void extractActiveContactName(AccessibilityNodeInfo root) {
        // WhatsApp contact name biasanya ada di ID 'conversation_contact_name'
        for (String id : new String[]{"com.whatsapp:id/conversation_contact_name", "com.whatsapp:id/conversation_contact_status"}) {
            List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(id);
            if (nodes != null && !nodes.isEmpty()) {
                CharSequence text = nodes.get(0).getText();
                if (text != null && text.length() > 0) {
                    activeChatTitle = text.toString();
                    return;
                }
            }
        }
    }

    private void scanChatMessages(AccessibilityNodeInfo node) {
        if (node == null) return;

        // Cek apakah node adalah teks pesan (com.whatsapp:id/message_text)
        CharSequence viewId = node.getViewIdResourceName();
        if (viewId != null && viewId.toString().contains("message_text")) {
            CharSequence msgText = node.getText();
            if (msgText != null && msgText.length() > 0) {
                String content = msgText.toString().trim();
                String key = activeChatTitle + ":" + content;

                if (!processedMessages.contains(key)) {
                    // Batasi cache pesan yang sudah diproses agar tidak memory leak
                    if (processedMessages.size() > 500) processedMessages.clear();
                    processedMessages.add(key);

                    // Deteksi apakah pesan dari User (Outgoing) atau Target (Incoming)
                    boolean isOutgoing = detectIfOutgoingMessage(node);
                    String role = isOutgoing ? "user" : "target";

                    Log.d(TAG, "Dua Arah Terdeteksi [" + role + "] (" + activeChatTitle + "): " + content);

                    // Kirim ke Event Bus AuraMatch
                    WhatsAppMessageEventBus.postMessage(
                        activeChatTitle,
                        content,
                        role,
                        System.currentTimeMillis()
                    );
                }
            }
        }

        // Rekursif telusuri anak-anak node
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                scanChatMessages(child);
                child.recycle();
            }
        }
    }

    private boolean detectIfOutgoingMessage(AccessibilityNodeInfo messageNode) {
        // Cek parent container untuk mencari icon status pesan terkirim (double checkmark / clock)
        AccessibilityNodeInfo parent = messageNode.getParent();
        if (parent == null) return false;

        try {
            List<AccessibilityNodeInfo> statusNodes = parent.findAccessibilityNodeInfosByViewId("com.whatsapp:id/status");
            if (statusNodes != null && !statusNodes.isEmpty()) {
                return true; // Ada status icon -> Ini pesan keluar dari kita!
            }
            if (parent.getContentDescription() != null && parent.getContentDescription().toString().toLowerCase().contains("anda")) {
                return true;
            }
        } catch (Exception ignored) {}
        
        return false;
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility Service diinterupsi");
    }
}
