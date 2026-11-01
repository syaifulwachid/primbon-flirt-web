package com.auramatch.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.graphics.Rect;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
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

                // 2. Baca seluruh gelembung percakapan di layar
                int screenWidth = getScreenWidth();
                scanChatMessages(rootNode, screenWidth);
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
        String[] candidateIds = new String[]{
            "com.whatsapp:id/conversation_contact_name",
            "com.whatsapp:id/conversation_contact_status",
            "com.whatsapp:id/action_bar_title",
            "com.whatsapp:id/title",
            "com.whatsapp:id/toolbar",
            "com.whatsapp:id/chat_title"
        };
        for (String id : candidateIds) {
            List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(id);
            if (nodes != null && !nodes.isEmpty()) {
                for (AccessibilityNodeInfo node : nodes) {
                    CharSequence text = node.getText();
                    if (text != null && text.length() > 0 && !text.toString().equalsIgnoreCase("WhatsApp")) {
                        activeChatTitle = text.toString().trim();
                        return;
                    }
                }
            }
        }
    }

    private void scanChatMessages(AccessibilityNodeInfo node, int screenWidth) {
        if (node == null) return;

        CharSequence viewId = node.getViewIdResourceName();
        CharSequence className = node.getClassName();
        CharSequence msgText = node.getText();

        boolean isTextView = (className != null && className.toString().contains("TextView"));
        boolean isMessageId = (viewId != null && (
            viewId.toString().contains("message_text") ||
            viewId.toString().contains("entry") ||
            viewId.toString().contains("caption") ||
            viewId.toString().contains("conversation_row")
        ));

        if ((isMessageId || isTextView) && msgText != null && msgText.length() > 0) {
            String content = msgText.toString().trim();

            if (isValidChatMessage(content)) {
                String key = activeChatTitle + ":" + content;

                if (!processedMessages.contains(key)) {
                    if (processedMessages.size() > 500) processedMessages.clear();
                    processedMessages.add(key);

                    // Deteksi apakah pesan dari User (Outgoing/Kiri-Kanan) atau Target (Incoming)
                    boolean isOutgoing = detectIfOutgoingMessage(node, screenWidth);
                    String role = isOutgoing ? "user" : "target";

                    Log.d(TAG, "Dua Arah Terdeteksi [" + role + "] (" + activeChatTitle + "): " + content);

                    // Catat ke TargetWhitelistManager & filter
                    boolean passed = TargetWhitelistManager.isTarget(getApplicationContext(), activeChatTitle);
                    if (passed) {
                        TargetWhitelistManager.recordDetection(activeChatTitle, content, true);

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
        }

        // Rekursif telusuri anak-anak node
        int childCount = node.getChildCount();
        for (int i = 0; i < childCount; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                scanChatMessages(child, screenWidth);
                child.recycle();
            }
        }
    }

    private boolean isValidChatMessage(String text) {
        if (text == null || text.trim().isEmpty()) return false;
        String t = text.trim();
        if (t.length() < 1) return false;
        // Abaikan format waktu seperti "14:02", "09.15", "10:30 AM"
        if (t.matches("^\\d{1,2}[:.]\\d{2}(\\s?[APap][Mm])?$")) return false;
        // Abaikan status umum UI
        if (t.equalsIgnoreCase("online") || t.equalsIgnoreCase("typing...") || 
            t.equalsIgnoreCase("ketik pesan") || t.equalsIgnoreCase("type a message") ||
            t.equalsIgnoreCase("whatsapp") || t.equalsIgnoreCase("panggilan video") ||
            t.equalsIgnoreCase("panggilan suara")) {
            return false;
        }
        return true;
    }

    private boolean detectIfOutgoingMessage(AccessibilityNodeInfo messageNode, int screenWidth) {
        if (messageNode == null) return false;

        // 1. Cek koordinat posisi balon chat di layar (Balon pesan keluar ada di sebelah kanan layar)
        if (screenWidth > 0) {
            Rect bounds = new Rect();
            messageNode.getBoundsInScreen(bounds);
            if (bounds.left > (screenWidth * 0.35)) {
                return true; // Pesan di sebelah kanan -> Pesan keluar dari pengguna!
            }
        }

        // 2. Fallback cek parent container untuk icon status pengiriman
        AccessibilityNodeInfo parent = messageNode.getParent();
        if (parent != null) {
            try {
                List<AccessibilityNodeInfo> statusNodes = parent.findAccessibilityNodeInfosByViewId("com.whatsapp:id/status");
                if (statusNodes != null && !statusNodes.isEmpty()) {
                    return true;
                }
                if (parent.getContentDescription() != null && parent.getContentDescription().toString().toLowerCase().contains("anda")) {
                    return true;
                }
            } catch (Exception ignored) {}
        }

        return false;
    }

    private int getScreenWidth() {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        return metrics.widthPixels;
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Accessibility Service diinterupsi");
    }
}
