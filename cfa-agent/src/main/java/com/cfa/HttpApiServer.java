package com.cfa;

import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Lightweight embedded HTTP REST server (Java HttpServer on port 8765).
 * Supports CORS so the React UI can connect directly from localhost:5173.
 */
public class HttpApiServer {

    private final int port;
    private HttpServer server;

    // Shared state references set by AgentMain
    volatile DatabaseManager databaseManager;
    volatile SecurityEngine securityEngine;
    volatile TelemetryCollector.TelemetrySnapshot latestTelemetry;
    volatile CSICalculator.CSIResult latestCSI;
    volatile PredictiveEngine.Forecast latestForecast;
    volatile AnomalyDetector anomalyDetector;
    volatile TelemetryCollector telemetryCollector;
    volatile LocalDataStore dataStore;
    volatile CSICalculator csiCalculator;
    volatile double bayesianConfidence;

    public HttpApiServer(int port) { this.port = port; }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/status",    this::handleStatus);
        server.createContext("/api/metrics",   this::handleMetrics);
        server.createContext("/api/anomalies", this::handleAnomalies);
        server.createContext("/api/prediction",this::handlePrediction);
        server.createContext("/api/weights",   this::handleWeights);
        server.createContext("/api/health",    this::handleHealth);
        server.createContext("/api/enroll",    this::handleEnroll);
        server.createContext("/api/raw-telemetry", this::handleRawTelemetry);
        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(4));
        server.start();
        System.out.println("[HttpApiServer] Listening on http://0.0.0.0:" + port);
    }

    private void handleStatus(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!checkAuth(ex)) return;
        CSICalculator.CSIResult r = latestCSI;
        TelemetryCollector.TelemetrySnapshot t = latestTelemetry;
        String json;
        if (r == null || t == null) {
            json = "{\"gcs\":0,\"wifiCSI\":0,\"btCSI\":0,\"netCSI\":0,\"sysCSI\":0,\"bayesian\":0.5,\"deviceId\":\"" + DeviceIdentity.getDeviceId().substring(0,16) + "\"}";
        } else {
            double[] w = csiCalculator.getWeights();
            json = String.format(
                "{\"gcs\":%.1f,\"wifiCSI\":%.1f,\"btCSI\":%.1f,\"netCSI\":%.1f,\"sysCSI\":%.1f," +
                "\"wifiRssi\":%.1f,\"btDeviceCount\":%d,\"latencyMs\":%.1f,\"cpuPercent\":%.1f,\"memPercent\":%.1f," +
                "\"bayesian\":%.3f,\"weights\":{\"wifi\":%.3f,\"bt\":%.3f,\"net\":%.3f,\"sys\":%.3f}," +
                "\"deviceId\":\"%s\",\"timestamp\":%d}",
                r.gcs, r.wifiCSI, r.btCSI, r.netCSI, r.sysCSI,
                t.wifiRssi, t.btDeviceCount, t.latencyMs, t.cpuPercent, t.memPercent,
                bayesianConfidence, w[0], w[1], w[2], w[3],
                DeviceIdentity.getDeviceId().substring(0, 16), r.timestamp);
        }
        send(ex, 200, json);
    }

    private void handleMetrics(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!checkAuth(ex)) return;
        List<String> lines = dataStore != null ? dataStore.readLast(60) : Collections.emptyList();
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lines.size(); i++) {
            sb.append(lines.get(i));
            if (i < lines.size() - 1) sb.append(",");
        }
        sb.append("]");
        send(ex, 200, sb.toString());
    }

    private void handleAnomalies(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!checkAuth(ex)) return;
        List<AnomalyDetector.AnomalyEvent> evts = anomalyDetector != null
            ? anomalyDetector.getRecentEvents(20) : Collections.emptyList();
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < evts.size(); i++) {
            AnomalyDetector.AnomalyEvent e = evts.get(i);
            sb.append(String.format(
                "{\"timestamp\":%d,\"type\":\"%s\",\"component\":\"%s\"," +
                "\"zScore\":%.2f,\"value\":%.1f,\"severity\":\"%s\",\"message\":\"%s\"}",
                e.timestamp, e.type, e.component, e.zScore, e.value, e.severity,
                e.message.replace("\"", "'")));
            if (i < evts.size() - 1) sb.append(",");
        }
        sb.append("]");
        send(ex, 200, sb.toString());
    }

    private void handlePrediction(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!checkAuth(ex)) return;
        PredictiveEngine.Forecast f = latestForecast;
        String json;
        if (f == null) {
            json = "{\"nextCSI\":50,\"trend\":\"STABLE\",\"decayLambda\":0,\"timeToThreshold\":9999}";
        } else {
            json = String.format(
                "{\"nextCSI\":%.1f,\"trend\":\"%s\",\"decayLambda\":%.4f,\"timeToThreshold\":%.1f}",
                f.nextCSI, f.trend, f.decayLambda, f.timeToThreshold);
        }
        send(ex, 200, json);
    }

    private void handleWeights(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!"POST".equals(ex.getRequestMethod())) { send(ex, 405, "{\"error\":\"POST only\"}"); return; }
        String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        // Simple JSON parse: {"wifi":0.3,"bt":0.15,"net":0.35,"sys":0.2}
        try {
            double wifi = extractDouble(body, "wifi");
            double bt   = extractDouble(body, "bt");
            double net  = extractDouble(body, "net");
            double sys  = extractDouble(body, "sys");
            if (csiCalculator != null) csiCalculator.updateWeights(wifi, bt, net, sys);
            send(ex, 200, "{\"status\":\"ok\"}");
        } catch (Exception e) {
            send(ex, 400, "{\"error\":\"invalid weights payload\"}");
        }
    }

    private void handleEnroll(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!"POST".equals(ex.getRequestMethod())) { send(ex, 405, "{\"error\":\"POST required\"}"); return; }
        
        String ip = ex.getRemoteAddress().getAddress().getHostAddress();
        if (securityEngine.isRateLimited(ip)) {
            send(ex, 429, "{\"error\":\"Too many attempts. Rate limit exceeded.\"}");
            return;
        }

        try {
            String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            String deviceId = extractString(body, "deviceId");
            String dcs      = extractString(body, "dcs");
            String fp       = extractString(body, "fingerprint");
            double entropy  = extractDouble(body, "entropy");
            long ts         = Long.parseLong(extractString(body, "timestamp"));
            String meta     = extractString(body, "meta");

            // Zero-Trust Validation
            if (!securityEngine.validateDCS(dcs, fp, entropy, ts)) {
                send(ex, 403, "{\"error\":\"Invalid Device Signature (DCS)\"}");
                return;
            }

            // Issue secure API Key
            String apiKey = securityEngine.generateApiKey(deviceId, ts);
            String hashed = securityEngine.hashKey(apiKey);
            long expiry   = System.currentTimeMillis() + (7L * 24 * 3600 * 1000); // 7 days

            // Persist
            databaseManager.registerDevice(deviceId, fp, dcs, meta);
            databaseManager.saveKey(deviceId, hashed, expiry);

            String json = String.format(
                "{\"status\":\"enrolled\",\"apiKey\":\"%s\",\"expiresAt\":%d}",
                apiKey, expiry
            );
            send(ex, 200, json);
        } catch (Exception e) {
            send(ex, 400, "{\"error\":\"Handshake failed: " + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    private boolean checkAuth(HttpExchange ex) throws IOException {
        String auth = ex.getRequestHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            send(ex, 401, "{\"error\":\"Missing Authorization Bearer token\"}");
            return false;
        }
        String token = auth.substring(7);
        String hashed = securityEngine.hashKey(token);
        if (!databaseManager.isValidKey(hashed)) {
            send(ex, 403, "{\"error\":\"Invalid or expired token\"}");
            return false;
        }
        return true;
    }

    private void handleRawTelemetry(HttpExchange ex) throws IOException {
        if ("OPTIONS".equals(ex.getRequestMethod())) { cors(ex, ""); return; }
        if (!checkAuth(ex)) return;
        String raw = telemetryCollector != null ? telemetryCollector.getRawTelemetry() : "Telemetry collector not available.";
        // Escape backslashes first, then quotes, then newlines
        String escaped = raw.replace("\\", "\\\\")
                            .replace("\"", "\\\"")
                            .replace("\n", "\\n")
                            .replace("\r", "");
        String json = "{\"raw\":\"" + escaped + "\"}";
        send(ex, 200, json);
    }

    private void handleHealth(HttpExchange ex) throws IOException {
        send(ex, 200, "{\"status\":\"ok\",\"agent\":\"CFA\",\"version\":\"1.0\"}");
    }

    private void cors(HttpExchange ex, String body) throws IOException {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
        ex.sendResponseHeaders(204, -1);
    }

    private void send(HttpExchange ex, int code, String json) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
    }

    private double extractDouble(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*([0-9.eE+\\-]+)";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return Double.parseDouble(m.group(1));
        throw new NumberFormatException("Double key not found: " + key);
    }

    private String extractString(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return m.group(1);
        
        // Try fallback for numeric timestamp as string
        pattern = "\"" + key + "\"\\s*:\\s*([0-9]+)";
        m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return m.group(1);

        throw new RuntimeException("String key not found: " + key);
    }

    public void stop() { if (server != null) server.stop(0); }
}
