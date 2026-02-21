package com.cfa;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

/**
 * DatabaseManager — Persistence Layer
 * Handles registration storage and API key management using a formal JSON index.
 * Designed to mirror SQLite behavior in a dependency-free environment.
 */
public class DatabaseManager {
    private final Path dbPath = Paths.get("cfa-data");
    private final Path deviceFile = dbPath.resolve("devices.jsonl");
    private final Path keysFile = dbPath.resolve("api_keys.jsonl");

    public DatabaseManager() {
        try {
            if (!Files.exists(dbPath)) Files.createDirectories(dbPath);
            if (!Files.exists(deviceFile)) Files.createFile(deviceFile);
            if (!Files.exists(keysFile)) Files.createFile(keysFile);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public synchronized void registerDevice(String deviceId, String fingerprint, String dcs, String meta) {
        String record = String.format("{\"deviceId\":\"%s\", \"fingerprint\":\"%s\", \"dcs\":\"%s\", \"meta\":%s, \"ts\":%d}\n",
            deviceId, fingerprint, dcs, meta, System.currentTimeMillis());
        appendToFile(deviceFile, record);
    }

    public synchronized void saveKey(String deviceId, String hashedKey, long expiry) {
        String record = String.format("{\"deviceId\":\"%s\", \"key\":\"%s\", \"expiry\":%d}\n",
            deviceId, hashedKey, expiry);
        appendToFile(keysFile, record);
    }

    public boolean isDeviceRegistered(String deviceId) {
        return searchFile(deviceFile, "\"deviceId\":\"" + deviceId + "\"");
    }

    public boolean isValidKey(String hashedKey) {
        String match = findInFile(keysFile, "\"key\":\"" + hashedKey + "\"");
        if (match == null) return false;
        
        // Basic check for expiry (parsing manually for simplicity in pure Java)
        try {
            long expiry = Long.parseLong(match.split("\"expiry\":")[1].split("}")[0].trim());
            return System.currentTimeMillis() < expiry;
        } catch (Exception e) {
            return false;
        }
    }

    private void appendToFile(Path path, String content) {
        try {
            Files.write(path, content.getBytes(StandardCharsets.UTF_8), StandardOpenOption.APPEND);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean searchFile(Path path, String query) {
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(query)) return true;
            }
        } catch (IOException e) {}
        return false;
    }

    private String findInFile(Path path, String query) {
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains(query)) return line;
            }
        } catch (IOException e) {}
        return null;
    }
}
