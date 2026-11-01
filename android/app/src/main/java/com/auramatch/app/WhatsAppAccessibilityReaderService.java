package com.auramatch.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Log;
import java.util.HashSet;
import java.util.Set;

/**
 * Accessibility Service untuk membaca percakapan WhatsApp dua arah
 * (Pesan Masuk dari Gebetan DAN Pesan Keluar dari Pengguna).
 * 
 * Bekerja langsung di atas layar chat WhatsApp aktif untuk mendapatkan
 * konteks utuh (Full Two-Way Thread Context) tanpa perlu copy-paste.
 */
public class WhatsAppAccessibilityReaderService extends AccessibilityService {

    private static final String TAG = "AuraMatchAccessibility";
    private static final Set<String> processedMessages = new HashSet<>();
    private static String activeChatTitle = "Target";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;

        CharSequence packageName = event.getPackageName();
        if (packageName == null || (!packageName.toString().contains("whatsapp"))) {
            return;
        }

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            // 1. Ekstrak nama kontak aktif dari header WhatsApp jika ada
            extractActiveContactName(rootNode);

            // 2. Baca seluruh gelembung percakapan di layar
            scanChatMessages(rootNode);
        } catch (Exception e) {
            Log.e(TAG, "Error saat membaca chat: " + e.getMessage());
        } finally {
            rootNode.recycle();
        }
    }

    private void extractActiveContactName(AccessibilityNodeInfo root) {
        // WhatsApp contact name biasanya ada di ID 'conversation_contact_name'
        for (String id : new String[]{"com.whatsapp:id/conversation_contact_name", "com.whatsapp:id/conversation_contact_status"}) {
            var nodes = root.findAccessibilityNodeInfosByViewId(id);
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
                    // Pesan keluar biasanya punya child/sibling ikon status pengiriman (status double check)
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
            var statusNodes = parent.findAccessibilityNodeInfosByViewId("com.whatsapp:id/status");
            if (statusNodes != null && !statusNodes.isEmpty()) {
                return true; // Ada status icon -> Ini pesan keluar dari kita!
            }
            var dateNodes = parent.findAccessibilityNodeInfosByViewId("com.whatsapp:id/date");
            // Outgoing bubbles di WhatsApp umumnya align di sebelah kanan atau memiliki descriptor status
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
