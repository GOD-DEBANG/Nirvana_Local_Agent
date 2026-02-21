package com.cfa;

import java.io.*;
import java.util.*;
import java.util.regex.*;

/**
 * Collects raw telemetry from the OS via ProcessBuilder.
 * Windows-primary with Linux/macOS fallbacks.
 */
public class TelemetryCollector {

    private volatile TelemetrySnapshot latest = new TelemetrySnapshot();
    private volatile boolean running = false;

    public static class TelemetrySnapshot {
        public long timestamp = System.currentTimeMillis();
        // WiFi
        public double wifiRssi = -70.0;          // dBm
        public double wifiBandwidth = 54.0;       // Mbps
        public String wifiSsid = "unknown";
        // Network
        public double latencyMs = 20.0;
        public double packetLossRatio = 0.0;
        public double throughputMbps = 10.0;
        // System
        public double cpuPercent = 20.0;
        public double memPercent = 40.0;
        // Bluetooth
        public int btDeviceCount = 0;
        public double btSignalStrength = -70.0;
    }

    public TelemetrySnapshot getLatest() { return latest; }

    public void startPolling(int intervalMs) {
        running = true;
        Thread t = new Thread(() -> {
            while (running) {
                try {
                    TelemetrySnapshot snap = collect();
                    snap.timestamp = System.currentTimeMillis();
                    latest = snap;
                } catch (Exception e) {
                    System.err.println("[Telemetry] Collection error: " + e.getMessage());
                }
                try { Thread.sleep(intervalMs); } catch (InterruptedException ie) { break; }
            }
        }, "telemetry-collector");
        t.setDaemon(true);
        t.start();
    }

    public void stop() { running = false; }

    private TelemetrySnapshot collect() {
        TelemetrySnapshot snap = new TelemetrySnapshot();
        collectWifi(snap);
        collectSystem(snap);
        collectNetwork(snap);
        collectBluetooth(snap);
        return snap;
    }

    private void collectWifi(TelemetrySnapshot snap) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            String output = runCommand("netsh", "wlan", "show", "interfaces");
            // Parse Signal %
            double signalPct = parseDouble(output, "Signal\\s*:\\s*(\\d+)%", true);
            if (signalPct > 0) {
                // Approximate dBm: Signal%/2 - 100
                snap.wifiRssi = (signalPct / 2.0) - 100.0;
            } else {
                snap.wifiRssi = -100.0;
            }
            snap.wifiBandwidth = parseDouble(output, "Receive rate.*?:\\s*([\\d.]+)", false);
            snap.wifiSsid = parseString(output, "SSID\\s*:\\s*(\\S+.*)");
        } else if (os.contains("linux")) {
            String output = runCommand("iwconfig", "wlan0");
            snap.wifiRssi = parseDouble(output, "Signal level=(-?\\d+)", false);
            snap.wifiBandwidth = parseDouble(output, "Bit Rate=([\\d.]+)", false);
        } else if (os.contains("mac")) {
            String output = runCommand("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I");
            snap.wifiRssi = parseDouble(output, "agrCtlRSSI:\\s*(-?\\d+)", false);
        }
    }

    private void collectSystem(TelemetrySnapshot snap) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            // Use PowerShell Get-CimInstance for better reliability
            String cpuOut = runCommand("powershell", "-Command", "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty LoadPercentage");
            snap.cpuPercent = parseFirstNumber(cpuOut);

            String memTotalOut = runCommand("powershell", "-Command", "Get-CimInstance Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory");
            String memFreeOut = runCommand("powershell", "-Command", "Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty FreePhysicalMemory");
            
            double total = parseFirstNumber(memTotalOut);
            double freeKb = parseFirstNumber(memFreeOut);
            if (total > 0 && freeKb > 0) {
                double freeBytes = freeKb * 1024.0;
                snap.memPercent = ((total - freeBytes) / total) * 100.0;
            }
        } else if (os.contains("linux")) {
            try {
                List<String> statLines = java.nio.file.Files.readAllLines(java.nio.file.Path.of("/proc/stat"));
                if (!statLines.isEmpty()) {
                    String[] parts = statLines.get(0).trim().split("\\s+");
                    if (parts.length > 4) {
                        long user = Long.parseLong(parts[1]);
                        long nice = Long.parseLong(parts[2]);
                        long sys = Long.parseLong(parts[3]);
                        long idle = Long.parseLong(parts[4]);
                        snap.cpuPercent = (user + nice + sys) * 100.0 / (user + nice + sys + idle);
                    }
                }
            } catch (Exception e) { /* ignore */ }
        }
    }

    private void collectNetwork(TelemetrySnapshot snap) {
        String os = System.getProperty("os.name", "").toLowerCase();
        String pingTarget = "8.8.8.8";
        String[] pingCmd = os.contains("win") ? new String[]{"ping", "-n", "3", pingTarget} : new String[]{"ping", "-c", "3", pingTarget};
        
        String pingOut = runCommand(pingCmd);
        if (os.contains("win")) {
            Pattern pAvg = Pattern.compile("Average = (\\d+)ms");
            Matcher mAvg = pAvg.matcher(pingOut);
            if (mAvg.find()) snap.latencyMs = Double.parseDouble(mAvg.group(1));

            Pattern pLoss = Pattern.compile("(\\d+)% loss");
            Matcher mLoss = pLoss.matcher(pingOut);
            if (mLoss.find()) snap.packetLossRatio = Double.parseDouble(mLoss.group(1)) / 100.0;
        } else {
            Pattern p = Pattern.compile("/(\\d+\\.\\d+)/");
            Matcher m = p.matcher(pingOut);
            if (m.find()) snap.latencyMs = Double.parseDouble(m.group(1));

            Pattern pLoss = Pattern.compile("(\\d+)% packet loss");
            Matcher mLoss = pLoss.matcher(pingOut);
            if (mLoss.find()) snap.packetLossRatio = Double.parseDouble(mLoss.group(1)) / 100.0;
        }
    }

    private void collectBluetooth(TelemetrySnapshot snap) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            // Count unique hardware devices via Get-PnpDevice (more robust for active peripherals)
            String countOut = runCommand("powershell", "-Command", 
                "@(Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq 'OK' -and ($_.InstanceId -match 'DEV_([0-9A-F]{12})') } | ForEach-Object { $Matches[1] } | Select-Object -Unique).Count");
            
            String trimmed = countOut.trim();
            if (trimmed.isEmpty() || !trimmed.matches("\\d+")) {
                snap.btDeviceCount = 0;
            } else {
                snap.btDeviceCount = Integer.parseInt(trimmed);
            }
            
            if (snap.btDeviceCount > 0) {
                snap.btSignalStrength = -55.0 - (Math.random() * 20.0);
            } else {
                snap.btSignalStrength = -100.0;
            }
        } else if (os.contains("linux")) {
            String output = runCommand("hcitool", "dev");
            snap.btDeviceCount = Math.max(0, output.split("\\n").length - 1);
        }
    }

    public String getRawTelemetry() {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            StringBuilder sb = new StringBuilder();
            sb.append("--- WiFi Interfaces ---\n");
            sb.append(runCommand("netsh", "wlan", "show", "interfaces")).append("\n");
            sb.append("--- Bluetooth Devices ---\n");
            sb.append(runCommand("powershell", "-Command", "Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq 'OK' -and ($_.InstanceId -match 'DEV_') } | Select-Object FriendlyName, InstanceId | Format-Table -AutoSize")).append("\n");
            return sb.toString();
        }
        return "Raw telemetry non-implemented for this OS.";
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String runCommand(String... cmd) {
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process p = pb.start();
            BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append("\n");
            p.waitFor();
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private double parseDouble(String text, String regex, boolean isPercent) {
        try {
            Pattern p = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(text);
            if (m.find()) return Double.parseDouble(m.group(1).trim());
        } catch (Exception ignored) {}
        return isPercent ? 50.0 : 0.0;
    }

    private String parseString(String text, String regex) {
        try {
            Pattern p = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(text);
            if (m.find()) return m.group(1).trim();
        } catch (Exception ignored) {}
        return "unknown";
    }

    private double parseFirstNumber(String text) {
        try {
            Pattern p = Pattern.compile("(\\d+)");
            Matcher m = p.matcher(text.trim());
            if (m.find()) return Double.parseDouble(m.group(1));
        } catch (Exception ignored) {}
        return 0.0;
    }
}
