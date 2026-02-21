package com.cfa;

import java.net.NetworkInterface;
import java.net.InetAddress;
import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.Properties;

/**
 * Generates a stable SHA-256 device fingerprint from system properties.
 * Used for device binding and API token generation.
 */
public class DeviceIdentity {

    private static String cached = null;

    public static String getDeviceId() {
        if (cached != null) return cached;
        try {
            Properties props = System.getProperties();
            StringBuilder raw = new StringBuilder();
            raw.append(props.getProperty("os.name", "unknown"));
            raw.append(props.getProperty("user.name", "unknown"));
            raw.append(InetAddress.getLocalHost().getHostName());
            // Add first non-loopback MAC address
            Enumeration<NetworkInterface> nets = NetworkInterface.getNetworkInterfaces();
            if (nets != null) {
                while (nets.hasMoreElements()) {
                    NetworkInterface ni = nets.nextElement();
                    byte[] mac = ni.getHardwareAddress();
                    if (mac != null) {
                        StringBuilder macSb = new StringBuilder();
                        for (byte b : mac) macSb.append(String.format("%02X", b));
                        raw.append(macSb);
                        break;
                    }
                }
            }
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.toString().getBytes("UTF-8"));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            cached = hex.toString();
        } catch (Exception e) {
            cached = "cfa-device-fallback-" + System.currentTimeMillis();
        }
        return cached;
    }

    /** Generate a simple API token from device ID + timestamp rotation */
    public static String generateToken() {
        try {
            String raw = getDeviceId() + "-" + (System.currentTimeMillis() / 3600000L);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes("UTF-8"));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.substring(0, 32);
        } catch (Exception e) {
            return "fallback-token-" + System.currentTimeMillis();
        }
    }
}
