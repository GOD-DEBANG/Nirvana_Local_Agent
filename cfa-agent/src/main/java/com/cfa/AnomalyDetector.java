package com.cfa;

import java.util.*;

/**
 * Anomaly detection using:
 *  1. Rolling Z-score (|z| > 2.5 triggers alert)
 *  2. Discrete Cosine Transform approximation for oscillation detection
 *  3. Bayesian confidence (Beta distribution) for stability scoring
 */
public class AnomalyDetector {

    private static final int Z_WINDOW = 30;
    private static final double Z_THRESHOLD = 2.5;

    private final Deque<Double> gcsHistory = new ArrayDeque<>();
    private final List<AnomalyEvent> events = Collections.synchronizedList(new ArrayList<>());
    private static final int MAX_EVENTS = 200;

    public static class AnomalyEvent {
        public long timestamp;
        public String type;       // "Z_SCORE" | "OSCILLATION" | "SPIKE"
        public String component;
        public double zScore;
        public double value;
        public String severity;   // "LOW" | "MEDIUM" | "HIGH"
        public String message;

        public AnomalyEvent(String type, String component, double zScore, double value, String severity, String msg) {
            this.timestamp = System.currentTimeMillis();
            this.type = type; this.component = component;
            this.zScore = zScore; this.value = value;
            this.severity = severity; this.message = msg;
        }
    }

    public void analyze(CSICalculator.CSIResult csi) {
        pushHistory(csi.gcs);
        checkZScore("GCS", csi.gcs);
        checkOscillation();
        checkSpike("WiFi", csi.wifiCSI);
        checkSpike("Network", csi.netCSI);
        checkSpike("System", csi.sysCSI);
    }

    private void checkZScore(String component, double value) {
        if (gcsHistory.size() < 5) return;
        double[] arr = gcsHistory.stream().mapToDouble(Double::doubleValue).toArray();
        double mean = mean(arr); double std = std(arr, mean);
        if (std < 0.01) return;
        double z = (value - mean) / std;
        if (Math.abs(z) > Z_THRESHOLD) {
            String sev = Math.abs(z) > 4.0 ? "HIGH" : Math.abs(z) > 3.0 ? "MEDIUM" : "LOW";
            addEvent(new AnomalyEvent("Z_SCORE", component, z, value, sev,
                String.format("%s Z-score %.2f detected (value=%.1f)", component, z, value)));
        }
    }

    private void checkOscillation() {
        if (gcsHistory.size() < 16) return;
        double[] arr = last(gcsHistory, 16);
        // Simplified DCT energy in high-frequency bins
        double hfEnergy = 0;
        for (int k = 8; k < 16; k++) {
            double sum = 0;
            for (int n = 0; n < 16; n++) {
                sum += arr[n] * Math.cos(Math.PI * k * (2.0 * n + 1) / 32.0);
            }
            hfEnergy += sum * sum;
        }
        hfEnergy = Math.sqrt(hfEnergy) / 16.0;
        if (hfEnergy > 15.0) {
            addEvent(new AnomalyEvent("OSCILLATION", "Signal", 0, hfEnergy, "MEDIUM",
                String.format("High-frequency oscillation detected (DCT energy=%.2f)", hfEnergy)));
        }
    }

    private void checkSpike(String component, double csiValue) {
        if (csiValue < 20.0) {
            addEvent(new AnomalyEvent("SPIKE", component, 0, csiValue, "HIGH",
                String.format("%s CSI critical: %.1f/100", component, csiValue)));
        }
    }

    /** Bayesian confidence: P(stable) modeled as Beta(α=successes, β=failures) mean */
    public double getBayesianConfidence() {
        if (gcsHistory.isEmpty()) return 0.5;
        double[] arr = gcsHistory.stream().mapToDouble(Double::doubleValue).toArray();
        int successes = 0, failures = 0;
        for (double v : arr) { if (v >= 60.0) successes++; else failures++; }
        // Beta distribution mean = α / (α + β)
        return (successes + 1.0) / (successes + failures + 2.0);
    }

    public List<AnomalyEvent> getRecentEvents(int n) {
        synchronized (events) {
            int from = Math.max(0, events.size() - n);
            return new ArrayList<>(events.subList(from, events.size()));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void addEvent(AnomalyEvent e) {
        synchronized (events) {
            events.add(e);
            if (events.size() > MAX_EVENTS) events.remove(0);
        }
        System.out.printf("[Anomaly] [%s] %s%n", e.severity, e.message);
    }

    private void pushHistory(double v) {
        gcsHistory.addLast(v); while (gcsHistory.size() > Z_WINDOW) gcsHistory.pollFirst();
    }

    private double mean(double[] a) { double s=0; for(double v:a) s+=v; return s/a.length; }
    private double std(double[] a, double m) {
        double s=0; for(double v:a) s+=(v-m)*(v-m); return Math.sqrt(s/a.length);
    }
    private double[] last(Deque<Double> dq, int n) {
        Double[] all = dq.toArray(new Double[0]);
        int from = Math.max(0, all.length - n);
        double[] r = new double[all.length - from];
        for (int i = 0; i < r.length; i++) r[i] = all[from + i];
        return r;
    }
}
