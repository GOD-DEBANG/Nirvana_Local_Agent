package com.cfa;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.zip.*;

/**
 * Secure heartbeat bridge to remote website (configurable via cfa.properties).
 * Sends GZIP-compressed JSON every 60 seconds.
 * Skips gracefully if remote URL is not configured.
 */
public class ApiSyncBridge implements Runnable {

    private final String remoteUrl;
    private final String apiToken;
    private final String deviceId;
    private volatile boolean running = true;

    // State references
    volatile CSICalculator.CSIResult latestCSI;
    volatile AnomalyDetector anomalyDetector;

    public ApiSyncBridge(String remoteUrl, String apiToken) {
        this.remoteUrl = remoteUrl;
        this.apiToken  = apiToken;
        this.deviceId  = DeviceIdentity.getDeviceId();
    }

    @Override
    public void run() {
        if (remoteUrl == null || remoteUrl.isEmpty() || remoteUrl.equals("YOUR_REMOTE_URL")) {
            System.out.println("[SyncBridge] Remote URL not configured — sync disabled.");
            return;
        }
        System.out.println("[SyncBridge] Starting heartbeat sync → " + remoteUrl);
        while (running) {
            try {
                Thread.sleep(60_000);
                sync();
            } catch (InterruptedException e) {
                break;
            } catch (Exception e) {
                System.err.println("[SyncBridge] Sync error: " + e.getMessage());
            }
        }
    }

    private void sync() throws Exception {
        CSICalculator.CSIResult r = latestCSI;
        if (r == null) return;

        String payload = buildPayload(r);
        byte[] compressed = gzip(payload.getBytes(StandardCharsets.UTF_8));

        URL url = new URL(remoteUrl + "/api/cfa/sync");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(10_000);
        conn.setDoOutput(true);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Content-Encoding", "gzip");
        conn.setRequestProperty("X-CFA-Device-Id", deviceId.substring(0, 16));
        conn.setRequestProperty("X-CFA-Token", apiToken);

        try (OutputStream os = conn.getOutputStream()) { os.write(compressed); }

        int code = conn.getResponseCode();
        System.out.printf("[SyncBridge] Heartbeat sent → HTTP %d%n", code);
    }

    private String buildPayload(CSICalculator.CSIResult r) {
        return String.format(
            "{\"deviceId\":\"%s\",\"timestamp\":%d,\"gcs\":%.1f," +
            "\"wifiCSI\":%.1f,\"btCSI\":%.1f,\"netCSI\":%.1f,\"sysCSI\":%.1f}",
            deviceId.substring(0, 16), r.timestamp, r.gcs,
            r.wifiCSI, r.btCSI, r.netCSI, r.sysCSI);
    }

    private byte[] gzip(byte[] data) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gz = new GZIPOutputStream(baos)) { gz.write(data); }
        return baos.toByteArray();
    }

    public void stop() { running = false; }
}
