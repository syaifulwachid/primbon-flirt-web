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

    @Override
    public void load() {
        super.load();

        TargetWhitelistManager.init(getContext());

        // Daftarkan listener ke WhatsAppMessageEventBus agar event disalurkan ke JS
        WhatsAppMessageEventBus.registerListener((sender, text, role, timestamp) -> {
            boolean passed = TargetWhitelistManager.isTarget(getContext(), sender);
            if (passed) {
                JSObject ret = new JSObject();
                ret.put("sender", sender);
                ret.put("text", text);
                ret.put("role", role); // "target" (inbound) atau "user" (outbound)
                ret.put("timestamp", timestamp);

                notifyListeners("onWhatsAppChatEvent", ret);
            }
        });
    }

    @PluginMethod
    public void updateTargetWhitelist(PluginCall call) {
        com.getcapacitor.JSArray arr = call.getArray("targets");
        java.util.List<String> list = new java.util.ArrayList<>();
        if (arr != null) {
            try {
                for (int i = 0; i < arr.length(); i++) {
                    list.add(arr.getString(i));
                }
            } catch (Exception ignored) {}
        }
        TargetWhitelistManager.setTargets(getContext(), list);
        call.resolve();
    }

    @PluginMethod
    public void setMonitorAllChats(PluginCall call) {
        boolean allowAll = call.getBoolean("allowAll", false);
        TargetWhitelistManager.setMonitorAll(getContext(), allowAll);
        com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
        ret.put("monitorAll", allowAll);
        call.resolve(ret);
    }

    @PluginMethod
    public void getDiagnosticStatus(PluginCall call) {
        Context context = getContext();
        com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
        ret.put("lastContact", TargetWhitelistManager.getLastContact());
        ret.put("lastMessage", TargetWhitelistManager.getLastMessage());
        ret.put("lastTimestamp", TargetWhitelistManager.getLastTimestamp());
        ret.put("lastFilterPassed", TargetWhitelistManager.getLastFilterPassed());
        ret.put("monitorAll", TargetWhitelistManager.isMonitorAll());
        ret.put("activeTargetsCount", TargetWhitelistManager.getActiveTargets().size());
        ret.put("isAccessibilityEnabled", isAccessibilityServiceEnabled(context));
        ret.put("isNotificationEnabled", isNotificationServiceEnabled(context));
        ret.put("isBubbleRunning", FloatingWingmanService.isRunning());

        com.getcapacitor.JSArray recentArr = new com.getcapacitor.JSArray();
        for (String c : TargetWhitelistManager.getRecentContacts()) {
            recentArr.put(c);
        }
        ret.put("recentContacts", recentArr);

        call.resolve(ret);
    }

    @PluginMethod
    public void showNotification(PluginCall call) {
        String title = call.getString("title", "🔮 AuraMatch Wingman");
        String body = call.getString("body", "Waktu terbaik untuk mengirim pesan!");
        Context context = getContext();

        try {
            android.app.NotificationManager notificationManager = 
                (android.app.NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            String channelId = "auramatch_channel";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    channelId,
                    "AuraMatch Alerts",
                    android.app.NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Notifikasi Jam Emas dan Rekomendasi PDKT");
                channel.enableVibration(true);
                notificationManager.createNotificationChannel(channel);
            }

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            android.app.PendingIntent pendingIntent = android.app.PendingIntent.getActivity(
                context,
                0,
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? android.app.PendingIntent.FLAG_IMMUTABLE : 0)
            );

            androidx.core.app.NotificationCompat.Builder builder = new androidx.core.app.NotificationCompat.Builder(context, channelId)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new androidx.core.app.NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

            notificationManager.notify((int) System.currentTimeMillis(), builder.build());
            call.resolve();
        } catch (Exception e) {
            call.reject("Gagal menampilkan notifikasi: " + e.getMessage());
        }
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
        res.put("isBubbleRunning", FloatingWingmanService.isRunning());
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

        if (FloatingWingmanService.isRunning()) {
            intent.setAction(FloatingWingmanService.ACTION_STOP);
            context.stopService(intent);
        } else {
            intent.setAction(FloatingWingmanService.ACTION_SHOW);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        }

        JSObject res = new JSObject();
        res.put("isBubbleRunning", !FloatingWingmanService.isRunning());
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
                Settings.Secure.ACCESSIBILITY_ENABLED);
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
