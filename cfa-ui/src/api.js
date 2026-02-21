/**
 * api.js — HTTP client for CFA services.
 * Talks to Java agent (proxied at /java-api) and Python AI (proxied at /ai-api).
 * Falls back to mock data when services are offline (dev mode).
 */

const isHosted = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Use 127.0.0.1 for maximum compatibility across different OS/Browser IP resolutions
const JAVA_BASE = isHosted ? 'http://127.0.0.1:8765/api' : '/java-api';
const AI_BASE   = isHosted ? 'http://127.0.0.1:8766'     : '/ai-api';
const TIMEOUT_MS = 10000;

function getAuthHeaders() {
  const token = localStorage.getItem('cfa_api_key');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  // Merge auth headers for Java API calls
  const headers = { ...opts.headers };
  if (url.includes(JAVA_BASE) && !url.includes('/enroll')) {
    Object.assign(headers, getAuthHeaders());
  }

  try {
    const res = await fetch(url, { ...opts, headers, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(id);
    // Provide a more descriptive error for connection failures
    if (e.name === 'AbortError') throw new Error('Connection timed out');
    if (e.message?.includes('Failed to fetch')) throw new Error('Local Agent Unreachable (check Mixed Content settings)');
    throw e;
  }
}

export async function checkHealth() {
  return fetchWithTimeout(`${JAVA_BASE}/health`);
}

// ── Java Agent Endpoints ─────────────────────────────────────────────────────

export async function enrollDevice(enrollData) {
  return fetchWithTimeout(`${JAVA_BASE}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrollData),
  });
}

export async function fetchStatus() {
  return fetchWithTimeout(`${JAVA_BASE}/status`);
}

export async function fetchMetrics() {
  return fetchWithTimeout(`${JAVA_BASE}/metrics`);
}

export async function fetchAnomalies() {
  return fetchWithTimeout(`${JAVA_BASE}/anomalies`);
}

export async function fetchPrediction() {
  return fetchWithTimeout(`${JAVA_BASE}/prediction`);
}

export async function fetchRawTelemetry() {
  return fetchWithTimeout(`${JAVA_BASE}/raw-telemetry`);
}

export async function postWeights(weights) {
  return fetchWithTimeout(`${JAVA_BASE}/weights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weights),
  });
}

// ── Python AI Endpoint ───────────────────────────────────────────────────────

export async function analyzeWithAI(telemetry) {
  return fetchWithTimeout(`${AI_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telemetry),
  });
}

// ── Mock data for standalone UI development ──────────────────────────────────

export function getMockStatus() {
  const gcs = 60 + Math.random() * 30;
  return {
    gcs:     parseFloat(gcs.toFixed(1)),
    wifiCSI: parseFloat((50 + Math.random() * 45).toFixed(1)),
    btCSI:   parseFloat((40 + Math.random() * 50).toFixed(1)),
    btDeviceCount: 0,
    netCSI:  parseFloat((55 + Math.random() * 40).toFixed(1)),
    sysCSI:  parseFloat((70 + Math.random() * 25).toFixed(1)),
    bayesian: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)),
    weights: { wifi: 0.30, bt: 0.15, net: 0.35, sys: 0.20 },
    deviceId: 'cfa-demo-device',
    timestamp: Date.now(),
  };
}

export function getMockAnomalies() {
  const types = ['Z_SCORE', 'OSCILLATION', 'SPIKE'];
  const comps = ['WiFi', 'Network', 'System', 'GCS'];
  const sevs  = ['LOW', 'MEDIUM', 'HIGH'];
  return Array.from({ length: 3 }, (_, i) => ({
    timestamp: Date.now() - i * 15000,
    type: types[i % 3],
    component: comps[i % 4],
    zScore: parseFloat((2 + Math.random() * 2).toFixed(2)),
    value: parseFloat((30 + Math.random() * 40).toFixed(1)),
    severity: sevs[i % 3],
    message: `Signal irregularity detected in ${comps[i % 4]} subsystem`,
  }));
}

export function getMockAI() {
  return {
    gcs: parseFloat((65 + Math.random() * 25).toFixed(1)),
    csi: { wifi: 72, bt: 58, net: 68, sys: 80 },
    forecast: { nextCSI: 71.2, trend: 'STABLE', decayLambda: 0.001, timeToThreshold: 9999 },
    anomaly: { z_score: 0.8, dct_energy: 3.2, bayesian: 0.82 },
    insight: 'Signal field exhibits quasi-stable entropic equilibrium. Latency dispersion within 1.2σ of baseline. No critical anomalies detected.',
    risk_factor: 'None',
    ai_confidence: 0.88,
    ai_source: 'mock',
  };
}

export function getMockRawTelemetry() {
  return {
    raw: `--- WiFi Interfaces ---

There is 1 interface on the system:

    Name                   : Wi-Fi
    Description            : Cognitive Realtek Emulator
    GUID                   : {885472bc-eb50-4829-87c2-1248967b5e8a}
    State                  : connected
    SSID                   : CFA_SECURE_NODE
    BSSID                  : 00:a0:c9:14:c8:29
    Network type           : Infrastructure
    Radio type             : 802.11ax
    Authentication         : WPA3-Personal
    Cipher                 : CCMP
    Connection mode        : Profile
    Channel                : 36
    Receive rate (Mbps)    : 866.7
    Transmit rate (Mbps)   : 866.7
    Signal                 : 98%

--- Bluetooth Devices ---

FriendlyName               InstanceId
------------               ----------
NB140N Bluetooth Speaker   BTHENUM\\DEV_4142F0DD7C23\\8&2A485A0&0&BLUETOOTHDEVICE_4142F0DD7C23
Generic BT Phone Emulator   BTHENUM\\DEV_2CE49ED12A45\\8&2A485A0&0&BLUETOOTHDEVICE_2CE49ED12A45
`
  };
}
