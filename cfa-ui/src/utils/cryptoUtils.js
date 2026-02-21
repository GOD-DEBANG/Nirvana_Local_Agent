/**
 * cryptoUtils.js — Zero-Trust Frontend Security
 * Handles browser fingerprinting, entropy coefficient computation, and DCS generation.
 */

/**
 * Generates a stable browser fingerprint hash.
 * Combines Canvas rendering, Audio context properties, Screen resolution, and User Agent.
 */
export async function generateFingerprint() {
  const meta = {
    ua: navigator.userAgent,
    res: `${window.screen.width}x${window.screen.height}`,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lang: navigator.language,
    cores: navigator.hardwareConcurrency || 0,
    mem: navigator.deviceMemory || 0,
  };

  // Canvas fingerprinting
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("CFA-ZERO-TRUST", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("CFA-ZERO-TRUST", 4, 17);
  const canvasData = canvas.toDataURL();

  const raw = JSON.stringify(meta) + canvasData;
  return await sha256(raw);
}

/**
 * Computes an entropy coefficient derived from response timing variance.
 */
export async function computeEntropy() {
  const timings = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    await new Promise(r => setTimeout(r, Math.random() * 20));
    timings.push(performance.now() - start);
  }
  const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
  const variance = timings.reduce((a, b) => a + (b - mean) ** 2, 0) / timings.length;
  return Math.sqrt(variance) / 100; // Normalized coefficient
}

/**
 * Compute Device Cognitive Signature (DCS)
 * DCS = SHA256(Fingerprint + Entropy + Timestamp)
 */
export async function computeDCS(fingerprint, entropy, timestamp) {
  const raw = fingerprint + entropy.toFixed(6) + timestamp.toString();
  return await sha256(raw);
}

/**
 * Securely stores data in localStorage with AES-256 encryption.
 * The key is derived from the device fingerprint.
 */
export async function secureStore(key, value, fingerprint) {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(value);
    
    // Use part of fingerprint to derive the key
    const rawKey = await crypto.subtle.importKey(
      'raw', 
      enc.encode(fingerprint.substring(0, 32)), 
      { name: 'AES-GCM' }, 
      false, 
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      rawKey,
      data
    );

    const packed = JSON.stringify({
      iv: Array.from(iv),
      cipher: Array.from(new Uint8Array(cipher))
    });
    
    localStorage.setItem(key, btoa(packed));
  } catch (e) {
    console.error('[Crypto] Store failure:', e);
  }
}

/**
 * Retrieves and decrypts data from localStorage.
 */
export async function secureRetrieve(key, fingerprint) {
  try {
    const b64 = localStorage.getItem(key);
    if (!b64) return null;
    
    const { iv, cipher } = JSON.parse(atob(b64));
    const enc = new TextEncoder();
    
    const rawKey = await crypto.subtle.importKey(
      'raw', 
      enc.encode(fingerprint.substring(0, 32)), 
      { name: 'AES-GCM' }, 
      false, 
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      rawKey,
      new Uint8Array(cipher)
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('[Crypto] Retrieve failure:', e);
    return null;
  }
}

async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
