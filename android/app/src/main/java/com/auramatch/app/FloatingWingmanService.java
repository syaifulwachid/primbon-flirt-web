package com.auramatch.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;

/**
 * Service untuk menampilkan Gelembung Melayang (Floating Bubble Overlay)
 * di atas layar WhatsApp saat pengguna sedang berinteraksi.
 */
public class FloatingWingmanService extends Service {

    private static final String TAG = "FloatingWingmanService";
    public static final String ACTION_SHOW = "ACTION_SHOW";
    public static final String ACTION_HIDE = "ACTION_HIDE";
    public static final String ACTION_STOP = "ACTION_STOP";

    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "auramatch_floating_wingman_channel";

    private static boolean isServiceRunning = false;

    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private boolean isViewAttached = false;

    public static boolean isRunning() {
        return isServiceRunning;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        isServiceRunning = true;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        startForegroundIfNeeded();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundIfNeeded();

        String action = (intent != null) ? intent.getAction() : null;
        if (ACTION_HIDE.equals(action)) {
            hideFloatingView();
        } else if (ACTION_STOP.equals(action)) {
            stopSelf();
        } else {
            // Default ACTION_SHOW
            showFloatingView();
        }

        return START_STICKY;
    }

    private void startForegroundIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "AuraMatch Floating Wingman",
                    NotificationManager.IMPORTANCE_LOW
                );
                channel.setDescription("Gelembung melayang AuraMatch di atas WhatsApp");
                nm.createNotificationChannel(channel);
            }

            Intent notificationIntent = new Intent(this, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("AuraMatch Wingman Aktif")
                .setContentText("Gelembung melayang siap mendampingi percakapan WhatsApp")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();

            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception e) {
                Log.e(TAG, "Error startForeground: " + e.getMessage());
            }
        }
    }

    private void showFloatingView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            Log.w(TAG, "Izin overlay belum diberikan (Settings.canDrawOverlays = false)");
            return;
        }

        if (floatingView == null) {
            createFloatingView();
        }

        if (floatingView != null) {
            if (!isViewAttached) {
                try {
                    windowManager.addView(floatingView, params);
                    isViewAttached = true;
                } catch (Exception e) {
                    Log.e(TAG, "Gagal menambahkan floatingView: " + e.getMessage());
                }
            }
            floatingView.setVisibility(View.VISIBLE);
        }
    }

    private void hideFloatingView() {
        if (floatingView != null && isViewAttached) {
            floatingView.setVisibility(View.GONE);
        }
    }

    private void createFloatingView() {
        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 30;
        params.y = 200;

        // Container melingkar
        FrameLayout container = new FrameLayout(this);
        int sizePx = dpToPx(56);
        FrameLayout.LayoutParams containerParams = new FrameLayout.LayoutParams(sizePx, sizePx);
        container.setLayoutParams(containerParams);

        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.OVAL);
        bg.setColor(Color.parseColor("#8B5CF6")); // Purple AuraMatch
        bg.setStroke(dpToPx(2), Color.WHITE);
        container.setBackground(bg);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            container.setElevation(dpToPx(6));
        }

        // Icon di dalam gelembung
        ImageView iconView = new ImageView(this);
        iconView.setImageResource(android.R.drawable.ic_dialog_info);
        iconView.setColorFilter(Color.WHITE);

        int iconPadding = dpToPx(14);
        iconView.setPadding(iconPadding, iconPadding, iconPadding, iconPadding);

        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
        iconView.setLayoutParams(iconParams);
        container.addView(iconView);

        floatingView = container;

        // Click handler
        floatingView.setOnClickListener(v -> {
            Intent appIntent = new Intent(this, MainActivity.class);
            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(appIntent);
            Toast.makeText(this, "AuraMatch Wingman Aktif", Toast.LENGTH_SHORT).show();
        });

        // Touch drag-and-drop listener
        floatingView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private boolean isClick = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        isClick = true;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        int diffX = (int) (event.getRawX() - initialTouchX);
                        int diffY = (int) (event.getRawY() - initialTouchY);
                        if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                            isClick = false;
                        }
                        params.x = initialX + diffX;
                        params.y = initialY + diffY;
                        if (isViewAttached) {
                            windowManager.updateViewLayout(floatingView, params);
                        }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (isClick) {
                            v.performClick();
                        }
                        return true;
                }
                return false;
            }
        });
    }

    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isServiceRunning = false;
        if (floatingView != null && isViewAttached) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception e) {
                Log.e(TAG, "Gagal removeView di onDestroy: " + e.getMessage());
            }
            isViewAttached = false;
        }
    }
}
