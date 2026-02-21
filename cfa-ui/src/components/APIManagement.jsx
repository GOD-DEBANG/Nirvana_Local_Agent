import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * APIManagement.jsx — Neural Console API Settings
 * Key rotation + Developer documentation.
 */

export default function APIManagement({ history, onDownloadWiFi, onDownloadBT }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('cfa_api_key') || 'CFA-KEY-NOT-FOUND');
  const [copied, setCopied] = useState(false);

  const rotateKey = () => {
    localStorage.removeItem('cfa_api_key');
    window.location.reload(); // Hard reset to trigger EnrollmentModal
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── API KEY MANAGEMENT ── */}
      <div className="glass p-4">
        <h3 className="font-orbitron text-xs tracking-widest mb-3" style={{ color: 'var(--violet-300)' }}>
          NEURAL SYNC STATUS
        </h3>
        
        <div className="bg-black/40 p-2 rounded border border-violet-500/20 mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-violet-200/60 truncate pr-2">
            Device Link: {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
          </span>
          <button 
            onClick={copyToClipboard}
            className="text-[9px] font-mono text-violet-400 hover:text-white transition-colors"
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>

        <button 
          onClick={rotateKey}
          className="w-full py-1.5 border border-violet-500/30 hover:bg-violet-500/10 text-violet-300 font-mono text-[10px] rounded transition-all"
        >
          RESET NEURAL SYNC
        </button>
      </div>

      {/* ── DIAGNOSTIC REPORTS ── */}
      <div className="glass p-4">
        <h3 className="font-orbitron text-xs tracking-widest mb-3" style={{ color: 'var(--violet-300)' }}>
          DIAGNOSTIC ARCHIVE
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onDownloadWiFi}
            className="flex flex-col items-center justify-center p-2 rounded border border-emerald-500/20 hover:bg-emerald-500/10 transition-all gap-1"
          >
            <span className="text-[14px]">📶</span>
            <span className="font-mono text-[9px] text-emerald-300 uppercase">WiFi PDF</span>
          </button>
          <button 
            onClick={onDownloadBT}
            className="flex flex-col items-center justify-center p-2 rounded border border-blue-500/20 hover:bg-blue-500/10 transition-all gap-1"
          >
            <span className="text-[14px]">🎧</span>
            <span className="font-mono text-[9px] text-blue-300 uppercase">Bluetooth PDF</span>
          </button>
        </div>
      </div>

      {/* ── INTEGRATION STATUS ── */}
      <div className="glass p-4">
        <h3 className="font-orbitron text-xs tracking-widest mb-3" style={{ color: 'var(--violet-300)' }}>
          INTEGRATION ENDPOINTS
        </h3>
        
        <div className="flex flex-col gap-2">
          <details className="cursor-pointer group">
            <summary className="font-mono text-[10px] text-violet-300/70 hover:text-white mb-1 outline-none">
              LOCAL TELEMETRY NODE
            </summary>
            <div className="bg-black/60 p-2 rounded text-[8px] text-violet-100/70 font-mono">
              ADDR: http://localhost:8765/api/status
              AUTH: Bearer {apiKey.substring(0, 12)}...
            </div>
          </details>

          <details className="cursor-pointer group">
            <summary className="font-mono text-[10px] text-violet-300/70 hover:text-white mb-1 outline-none">
              AI PREDICTION NODE
            </summary>
            <div className="bg-black/60 p-2 rounded text-[8px] text-violet-100/70 font-mono">
              ADDR: http://localhost:8766/analyze
              NODE: CFA-AI-V1 (Python)
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
