package com.cfa;

import java.util.*;

/**
 * Predictive engine using:
 *  1. Moving window linear regression for next-sample CSI prediction
 *  2. Exponential decay model for signal decay forecast
 */
public class PredictiveEngine {

    private static final int REGRESSION_WINDOW = 20;
    private final Deque<Double> history = new ArrayDeque<>();

    public static class Forecast {
        public double nextCSI;
        public double decayLambda;        // decay rate λ
        public double timeToThreshold;    // seconds until CSI drops below 40
        public String trend;              // "STABLE" | "IMPROVING" | "DEGRADING"
    }

    public void addSample(double gcs) {
        history.addLast(gcs);
        while (history.size() > REGRESSION_WINDOW) history.pollFirst();
    }

    public Forecast forecast() {
        Forecast f = new Forecast();
        double[] arr = history.stream().mapToDouble(Double::doubleValue).toArray();
        int n = arr.length;

        if (n < 3) {
            f.nextCSI = n > 0 ? arr[n-1] : 50.0;
            f.trend = "STABLE";
            f.decayLambda = 0.0;
            f.timeToThreshold = 9999.0;
            return f;
        }

        // Simple OLS linear regression: y = a + b*x
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX  += i; sumY  += arr[i];
            sumXY += i * arr[i]; sumX2 += (double)i * i;
        }
        double slope     = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 1e-9);
        double intercept = (sumY - slope * sumX) / n;
        f.nextCSI = Math.max(0, Math.min(100, intercept + slope * n));

        // Trend classification
        if (Math.abs(slope) < 0.3) f.trend = "STABLE";
        else if (slope > 0)        f.trend = "IMPROVING";
        else                       f.trend = "DEGRADING";

        // Exponential decay fit: CSI(t) = CSI0 * e^(-λt)
        // Estimate λ from slope: if degrading, λ ≈ -slope/mean
        double mean = sumY / n;
        if (slope < 0 && mean > 0) {
            f.decayLambda = -slope / (mean + 1e-9);
            // Time to reach threshold 40: t = ln(CSI0/40) / λ
            double csi0 = arr[n-1];
            if (csi0 > 40 && f.decayLambda > 0) {
                f.timeToThreshold = Math.log(csi0 / 40.0) / f.decayLambda;
            } else {
                f.timeToThreshold = csi0 <= 40 ? 0 : 9999.0;
            }
        } else {
            f.decayLambda = 0.0;
            f.timeToThreshold = 9999.0;
        }

        return f;
    }
}
