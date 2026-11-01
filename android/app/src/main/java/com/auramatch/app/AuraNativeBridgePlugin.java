package com.auramatch.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AuraNativeBridge")
public class AuraNativeBridgePlugin extends Plugin {

    private boolean isBubbleRunning = false;

    @Override
    public void load() {
        super.load();

        // Daftarkan listener ke WhatsAppMessageEventBus agar event disalurkan ke JS
        WhatsAppMessageEventBus.registerListener((sender, text, role, timestamp) -> {
            JSObject ret = new JSObject();
            ret.put("sender", sender);
            ret.put("text", text);
            ret.put("role", role); // "target" (inbound) atau "user" (outbound)
            ret.put("timestamp", timestamp);

            notifyListeners("onWhatsAppChatEvent", ret);
        });
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        Context context = getContext();

        boolean hasNotification = isNotificationServiceEnabled(context);
        boolean hasOverlay = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(context);
        boolean hasAccessibility = isAccessibilityServiceEnabled(context);

        JSObject res = new JSObject();
        res.put("notificationListener", hasNotification);
        res.put("overlay", hasOverlay);
        res.put("accessibility", hasAccessibility);
        res.put("isBubbleRunning", isBubbleRunning);
        call.resolve(res);
    }

    @PluginMethod
    public void openPermissionSettings(PluginCall call) {
        String type = call.getString("type", "notification");
        Context context = getContext();
        Intent intent;

        switch (type) {
            case "overlay":
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:" + context.getPackageName()));
                } else {
                    call.resolve();
                    return;
                }
                break;
            case "accessibility":
                intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                break;
            case "notification":
            default:
                intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
                break;
        }

        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void toggleFloatingBubble(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, FloatingWingmanService.class);

        if (isBubbleRunning) {
            context.stopService(intent);
            isBubbleRunning = false;
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
            isBubbleRunning = true;
        }

        JSObject res = new JSObject();
        res.put("isBubbleRunning", isBubbleRunning);
        call.resolve(res);
    }

    @PluginMethod
    public void logUserReply(PluginCall call) {
        String text = call.getString("text", "");
        String sender = call.getString("sender", "Target");
        
        // Broadcast outbound reply to EventBus
        WhatsAppMessageEventBus.postMessage(sender, text, "user", System.currentTimeMillis());
        
        call.resolve();
    }

    private boolean isNotificationServiceEnabled(Context context) {
        String pkgName = context.getPackageName();
        final String flat = Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
        if (!TextUtils.isEmpty(flat)) {
            final String[] names = flat.split(":");
            for (String name : names) {
                final ComponentName cn = ComponentName.unflattenFromString(name);
                if (cn != null && TextUtils.equals(pkgName, cn.getPackageName())) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isAccessibilityServiceEnabled(Context context) {
        int accessibilityEnabled = 0;
        final String service = context.getPackageName() + "/" + WhatsAppAccessibilityReaderService.class.getName();
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                context.getApplicationContext().getContentResolver(),
                android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException ignored) {}

        TextUtils.SimpleStringSplitter mStringColonSplitter = new TextUtils.SimpleStringSplitter(':');

        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(
                context.getApplicationContext().getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (settingValue != null) {
                mStringColonSplitter.setString(settingValue);
                while (mStringColonSplitter.hasNext()) {
                    String accessibilityService = mStringColonSplitter.next();
                    if (accessibilityService.equalsIgnoreCase(service)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
