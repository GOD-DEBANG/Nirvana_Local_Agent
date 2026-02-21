package com.cfa;

import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Flat-file JSON lines store. Maintains rolling buffer of last MAX_LINES records.
 */
public class LocalDataStore {

    private static final int MAX_LINES = 1000;
    private final Path dataFile;
    private final Object lock = new Object();

    public LocalDataStore(String dataDir) throws IOException {
        Files.createDirectories(Path.of(dataDir));
        this.dataFile = Path.of(dataDir, "metrics.jsonl");
        if (!Files.exists(dataFile)) Files.createFile(dataFile);
    }

    /** Append a single JSON object line */
    public void append(String jsonLine) {
        synchronized (lock) {
            try {
                List<String> lines = new ArrayList<>(Files.readAllLines(dataFile));
                lines.add(jsonLine);
                // Rolling trim
                if (lines.size() > MAX_LINES) {
                    lines = lines.subList(lines.size() - MAX_LINES, lines.size());
                }
                Files.write(dataFile, lines);
            } catch (IOException e) {
                System.err.println("[DataStore] Write error: " + e.getMessage());
            }
        }
    }

    /** Read last N records */
    public List<String> readLast(int n) {
        synchronized (lock) {
            try {
                List<String> lines = Files.readAllLines(dataFile);
                if (lines.size() <= n) return new ArrayList<>(lines);
                return new ArrayList<>(lines.subList(lines.size() - n, lines.size()));
            } catch (IOException e) {
                return Collections.emptyList();
            }
        }
    }

    /** Read all records */
    public List<String> readAll() {
        return readLast(MAX_LINES);
    }
}
