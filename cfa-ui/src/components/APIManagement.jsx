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
          API AUTHENTICATION
        </h3>
        
        <div className="bg-black/40 p-2 rounded border border-violet-500/20 mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-violet-200 truncate pr-2">
            {apiKey}
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
          ROTATE CREDENTIALS
        </button>
      </div>

      {/* ── DIAGNOSTIC REPORTS ── */}
      <div className="glass p-4">
        <h3 className="font-orbitron text-xs tracking-widest mb-3" style={{ color: 'var(--violet-300)' }}>
          SYSTEM REPORTS
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onDownloadWiFi}
            className="flex flex-col items-center justify-center p-2 rounded border border-emerald-500/20 hover:bg-emerald-500/10 transition-all gap-1"
          >
            <span className="text-[14px]">📶</span>
            <span className="font-mono text-[9px] text-emerald-300">WIFI PDF</span>
          </button>
          <button 
            onClick={onDownloadBT}
            className="flex flex-col items-center justify-center p-2 rounded border border-blue-500/20 hover:bg-blue-500/10 transition-all gap-1"
          >
            <span className="text-[14px]">🎧</span>
            <span className="font-mono text-[9px] text-blue-300">BT PDF</span>
          </button>
        </div>
      </div>

      {/* ── DEVELOPER DOCS ── */}
      <div className="glass p-4">
        <h3 className="font-orbitron text-xs tracking-widest mb-3" style={{ color: 'var(--violet-300)' }}>
          INTEGRATION GUIDE
        </h3>
        
        <div className="flex flex-col gap-2">
          <details className="cursor-pointer group">
            <summary className="font-mono text-[10px] text-violet-300 hover:text-white mb-1 outline-none">
              FETCH TELEMETRY (REST)
            </summary>
            <pre className="bg-black/60 p-2 rounded text-[8px] text-violet-100/70 font-mono overflow-x-auto">
{`GET http://localhost:8765/api/status
Authorization: Bearer ${apiKey}`}
            </pre>
          </details>

          <details className="cursor-pointer group">
            <summary className="font-mono text-[10px] text-violet-300 hover:text-white mb-1 outline-none">
              AI ANALYSIS (POST)
            </summary>
            <pre className="bg-black/60 p-2 rounded text-[8px] text-violet-100/70 font-mono overflow-x-auto">
{`POST http://localhost:8766/analyze
Content-Type: application/json

{
  "rssi": -65,
  "bt_count": 1
}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
