package com.cfa;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * SecurityEngine — Zero-Trust Validation & HMAC Signer
 * Handles DCS verification, replay protection, and cryptographically secure key generation.
 */
public class SecurityEngine {
    private final String serverSecret;
    private final Map<String, Long> rateLimitMap = new ConcurrentHashMap<>();
    private static final long REPLAY_WINDOW_MS = 60_000; // 60 seconds
    private static final int MAX_ENROLL_PER_MINUTE = 5;

    public SecurityEngine(String secret) {
        this.serverSecret = (secret == null || secret.isEmpty()) ? "CFA_DEFAULT_SECURE_SECRET_2026" : secret;
    }

    /**
     * Validates Device Cognitive Signature (DCS)
     * DCS = SHA256(Fingerprint + Entropy + Timestamp)
     */
    public boolean validateDCS(String dcs, String fingerprint, double entropy, long timestamp) {
        // 1. Replay Protection
        long now = System.currentTimeMillis();
        if (Math.abs(now - timestamp) > REPLAY_WINDOW_MS) {
            System.err.println("[Security] Invalid handshake: Replay detected or clock out of sync.");
            return false;
        }

        // 2. Compute Expected DCS
        try {
            String raw = fingerprint + String.format("%.6f", entropy) + timestamp;
            String expected = sha256(raw);
            return expected.equalsIgnoreCase(dcs);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Generates a secure API key using HMAC-SHA256
     * API_KEY = HMAC_SHA256(DeviceID + Timestamp + ServerSecret)
     */
    public String generateApiKey(String deviceId, long timestamp) {
        try {
            String data = deviceId + ":" + timestamp;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(serverSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate API key", e);
        }
    }

    /**
     * Verifies if a request is rate-limited
     */
    public boolean isRateLimited(String identifier) {
        long now = System.currentTimeMillis();
        rateLimitMap.values().removeIf(ts -> ts < now - 60_000);
        
        long count = rateLimitMap.keySet().stream()
            .filter(k -> k.startsWith(identifier))
            .count();
            
        if (count >= MAX_ENROLL_PER_MINUTE) return true;
        
        rateLimitMap.put(identifier + ":" + now, now);
        return false;
    }

    public String hashKey(String apiKey) {
        return sha256(apiKey);
    }

    private String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
