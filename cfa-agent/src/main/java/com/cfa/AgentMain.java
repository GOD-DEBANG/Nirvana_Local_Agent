package com.cfa;

import java.io.*;
import java.util.Properties;

/**
 * CFA Agent Entry Point.
 * Orchestrates all subsystems in managed daemon threads.
 */
public class AgentMain {

    private static final String DATA_DIR = "cfa-data";
    private static final String PROPS_FILE = "cfa.properties";

    public static void main(String[] args) throws Exception {
        System.out.println("--------------------------------------------");
        System.out.println("  Cognitive Field Analyzer (CFA) v1.0     ");
        System.out.println("  Device: " + DeviceIdentity.getDeviceId().substring(0, 16) + "...  ");
        System.out.println("--------------------------------------------");

        // ── Load config ──────────────────────────────────────────────────────
        Properties props = loadProperties();
        String remoteUrl = props.getProperty("remote.url", "");
        String apiToken  = props.getProperty("api.token", DeviceIdentity.generateToken());
        int httpPort     = Integer.parseInt(props.getProperty("http.port", "8765"));
        int pollInterval = Integer.parseInt(props.getProperty("poll.interval.ms", "5000"));

        // ── Initialize subsystems ────────────────────────────────────────────
        LocalDataStore dataStore         = new LocalDataStore(DATA_DIR);
        DatabaseManager db               = new DatabaseManager();
        SecurityEngine security          = new SecurityEngine(props.getProperty("server.secret", ""));
        TelemetryCollector telemetry     = new TelemetryCollector();
        CSICalculator csiCalc            = new CSICalculator();
        AnomalyDetector anomalyDet       = new AnomalyDetector();
        PredictiveEngine predictor       = new PredictiveEngine();
        HttpApiServer apiServer          = new HttpApiServer(httpPort);
        ApiSyncBridge syncBridge         = new ApiSyncBridge(remoteUrl, apiToken);

        // Wire server state references
        apiServer.databaseManager    = db;
        apiServer.securityEngine     = security;
        apiServer.anomalyDetector    = anomalyDet;
        apiServer.telemetryCollector = telemetry;
        apiServer.dataStore          = dataStore;
        apiServer.csiCalculator      = csiCalc;
        syncBridge.anomalyDetector   = anomalyDet;

        // ── Start subsystems ─────────────────────────────────────────────────
        telemetry.startPolling(pollInterval);
        apiServer.start();

        Thread syncThread = new Thread(syncBridge, "sync-bridge");
        syncThread.setDaemon(true);
        syncThread.start();

        // ── Main compute loop (every 3 seconds) ──────────────────────────────
        System.out.println("[AgentMain] Starting compute loop (3s cycle)...");
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("[AgentMain] Shutting down...");
            telemetry.stop();
            syncBridge.stop();
            apiServer.stop();
        }));

        while (true) {
            try {
                TelemetryCollector.TelemetrySnapshot snap = telemetry.getLatest();

                // Compute CSI
                CSICalculator.CSIResult csi = csiCalc.compute(snap);
                apiServer.latestCSI  = csi;
                apiServer.latestTelemetry = snap;
                syncBridge.latestCSI = csi;

                // Anomaly detection
                anomalyDet.analyze(csi);
                apiServer.bayesianConfidence = anomalyDet.getBayesianConfidence();

                // Predictive forecast
                predictor.addSample(csi.gcs);
                PredictiveEngine.Forecast forecast = predictor.forecast();
                // Wrap forecast into proxy object for API server
                apiServer.latestForecast = new PredictiveEngine.Forecast();
                apiServer.latestForecast.nextCSI = forecast.nextCSI;
                apiServer.latestForecast.trend = forecast.trend;
                apiServer.latestForecast.decayLambda = forecast.decayLambda;
                apiServer.latestForecast.timeToThreshold = forecast.timeToThreshold;

                // Persist snapshot to JSON lines
                String jsonLine = buildSnapshotJson(snap, csi);
                dataStore.append(jsonLine);

                System.out.printf("[CFA] GCS=%.1f | WiFi=%.1f BT=%.1f Net=%.1f Sys=%.1f | Trend=%s%n",
                    csi.gcs, csi.wifiCSI, csi.btCSI, csi.netCSI, csi.sysCSI, forecast.trend);

            } catch (Exception e) {
                System.err.println("[AgentMain] Compute cycle error: " + e.getMessage());
            }
            Thread.sleep(3000);
        }
    }

    private static String buildSnapshotJson(TelemetryCollector.TelemetrySnapshot snap,
                                             CSICalculator.CSIResult csi) {
        return String.format(
            "{\"ts\":%d,\"gcs\":%.1f,\"wifiCSI\":%.1f,\"btCSI\":%.1f,\"netCSI\":%.1f,\"sysCSI\":%.1f," +
            "\"rssi\":%.1f,\"latency\":%.1f,\"packetLoss\":%.3f,\"cpu\":%.1f,\"mem\":%.1f,\"btCount\":%d}",
            snap.timestamp, csi.gcs, csi.wifiCSI, csi.btCSI, csi.netCSI, csi.sysCSI,
            snap.wifiRssi, snap.latencyMs, snap.packetLossRatio,
            snap.cpuPercent, snap.memPercent, snap.btDeviceCount);
    }

    private static Properties loadProperties() {
        Properties p = new Properties();
        try (FileInputStream fis = new FileInputStream(PROPS_FILE)) {
            p.load(fis);
        } catch (IOException e) {
            System.out.println("[AgentMain] No cfa.properties found – using defaults.");
        }
        return p;
    }
}
