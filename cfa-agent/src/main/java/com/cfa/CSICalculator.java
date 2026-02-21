package com.cfa;

import java.util.*;

/**
 * Implements the Cognitive Stability Index (CSI) scoring model.
 *
 *   CSI = (SignalStrength × StabilityFactor × TimeConsistency) / (Noise + Entropy + Variance + ε)
 *
 *   GCS = Σ (Wi × CSIi)   weights supplied by Python AI, default = equal
 */
public class CSICalculator {

    // Sliding window for moving averages (signal samples)
    private static final int WINDOW = 60;

    // Windows for each signal type
    private final Deque<Double> wifiWindow   = new ArrayDeque<>();
    private final Deque<Double> btWindow     = new ArrayDeque<>();
    private final Deque<Double> netWindow    = new ArrayDeque<>();
    private final Deque<Double> sysWindow    = new ArrayDeque<>();

    // Adaptive weights updated by Python AI
    private volatile double wWifi   = 0.30;
    private volatile double wBt     = 0.15;
    private volatile double wNet    = 0.35;
    private volatile double wSys    = 0.20;

    public static class CSIResult {
        public double wifiCSI, btCSI, netCSI, sysCSI, gcs;
        public long timestamp = System.currentTimeMillis();
    }

    /** Push a new telemetry sample and compute all CSI values */
    public CSIResult compute(TelemetryCollector.TelemetrySnapshot snap) {
        // Normalize raw signals to [0,1]
        double wifiSig  = normalize(snap.wifiRssi, -100, -30);
        double bwNorm   = normalize(snap.wifiBandwidth, 0, 600);
        double btSig    = normalize(snap.btSignalStrength, -100, -30);
        double netSig   = normalize(100.0 - snap.packetLossRatio * 100.0, 0, 100);
        double sysSig   = normalize(100.0 - snap.cpuPercent, 0, 100);
        double memSig   = normalize(100.0 - snap.memPercent, 0, 100);

        // Push to windows
        pushWindow(wifiWindow,  (wifiSig + bwNorm) / 2.0);
        pushWindow(btWindow,    btSig);
        pushWindow(netWindow,   netSig);
        pushWindow(sysWindow,   (sysSig + memSig) / 2.0);

        CSIResult r = new CSIResult();
        r.wifiCSI = csi(wifiWindow,  snap.packetLossRatio,  snap.latencyMs);
        r.btCSI   = csi(btWindow,    0.0,                   0.0);
        r.netCSI  = csi(netWindow,   snap.packetLossRatio,  snap.latencyMs);
        r.sysCSI  = csi(sysWindow,   0.0,                   0.0);
        r.gcs     = wWifi * r.wifiCSI + wBt * r.btCSI + wNet * r.netCSI + wSys * r.sysCSI;

        // Scale GCS to 0-100
        r.gcs = Math.min(100.0, r.gcs * 100.0);
        r.wifiCSI *= 100.0; r.btCSI *= 100.0; r.netCSI *= 100.0; r.sysCSI *= 100.0;
        return r;
    }

    /**
     * Core CSI formula for a given window:
     *   CSI = (SignalStrength × StabilityFactor × TimeConsistency) / (Noise + Entropy + Variance + ε)
     */
    private double csi(Deque<Double> window, double packetLoss, double latencyMs) {
        if (window.isEmpty()) return 0.0;
        double[] arr = window.stream().mapToDouble(Double::doubleValue).toArray();

        double mean   = mean(arr);
        double stddev = stddev(arr, mean);
        double entropy = shannonEntropy(arr);
        double variance = stddev * stddev;

        double signalStrength = mean;                          // normalized [0,1]
        double stabilityFactor = 1.0 / (stddev + 0.001);      // 1/σ
        double timeConsistency = movingAverage(arr, 10);       // MA10

        double noise = Math.min(1.0, packetLoss + latencyMs / 500.0);

        double numerator   = signalStrength * stabilityFactor * timeConsistency;
        double denominator = noise + entropy + variance + 1e-6;

        double raw = numerator / denominator;
        // Normalize to [0,1] via sigmoid-like saturation
        return raw / (raw + 1.0);
    }

    // ── Math helpers ─────────────────────────────────────────────────────────

    private double mean(double[] arr) {
        double sum = 0; for (double v : arr) sum += v; return sum / arr.length;
    }

    private double stddev(double[] arr, double mean) {
        double sq = 0; for (double v : arr) sq += (v - mean) * (v - mean);
        return Math.sqrt(sq / arr.length);
    }

    private double movingAverage(double[] arr, int n) {
        int start = Math.max(0, arr.length - n);
        double sum = 0; int count = 0;
        for (int i = start; i < arr.length; i++) { sum += arr[i]; count++; }
        return count > 0 ? sum / count : 0.0;
    }

    /** Shannon entropy over discretized [0,1] signal in 10 buckets */
    private double shannonEntropy(double[] arr) {
        int[] buckets = new int[10];
        for (double v : arr) {
            int idx = Math.min(9, (int)(v * 10));
            buckets[idx]++;
        }
        double h = 0;
        for (int b : buckets) {
            if (b > 0) {
                double p = (double) b / arr.length;
                h -= p * Math.log(p) / Math.log(2);
            }
        }
        return h / 3.322; // normalize to [0,1] over 10 buckets (log2(10)≈3.322)
    }

    private double normalize(double val, double min, double max) {
        if (max == min) return 0.5;
        return Math.max(0.0, Math.min(1.0, (val - min) / (max - min)));
    }

    private void pushWindow(Deque<Double> dq, double val) {
        dq.addLast(val);
        while (dq.size() > WINDOW) dq.pollFirst();
    }

    /** Called by Python AI bridge to update adaptive weights */
    public void updateWeights(double wifi, double bt, double net, double sys) {
        double sum = wifi + bt + net + sys;
        if (sum == 0) return;
        this.wWifi = wifi / sum;
        this.wBt   = bt   / sum;
        this.wNet  = net  / sum;
        this.wSys  = sys  / sum;
        System.out.printf("[CSI] Weights updated → WiFi=%.2f BT=%.2f Net=%.2f Sys=%.2f%n",
            this.wWifi, this.wBt, this.wNet, this.wSys);
    }

    public double[] getWeights() { return new double[]{ wWifi, wBt, wNet, wSys }; }
}
