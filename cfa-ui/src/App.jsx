/**
 * App.jsx — CFA Neural Console
 * Main dashboard assembler. Renders the full dark futuristic layout.
 */

import './index.css';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground   from './components/ParticleBackground';
import GlobalCognitiveDial  from './components/GlobalCognitiveDial';
import CSIMeter              from './components/CSIMeter';
import NetworkEntropyGraph   from './components/NetworkEntropyGraph';
import AnomalyAlerts         from './components/AnomalyAlerts';
import AIInsightPanel        from './components/AIInsightPanel';
import SpectrumAnalyzer      from './components/SpectrumAnalyzer';
import APIManagement         from './components/APIManagement';
import useMetrics            from './hooks/useMetrics';
import EnrollmentModal      from './components/EnrollmentModal';
import Guidelines           from './components/Guidelines';
import { downloadWiFiReport, downloadBluetoothReport } from './utils/reportUtils';
import { useState } from 'react';

function StatusDot({ active, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: active ? '#10B981' : '#5C5080',
        boxShadow: active ? '0 0 6px #10B981' : 'none',
      }} />
      <span className="font-mono" style={{ fontSize: 10, color: active ? '#10B981' : 'var(--text-dim)' }}>
        {label}
      </span>
    </div>
  );
}

function ConnectionAlert({ online, onClick }) {
  if (online.java && online.ai) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mb-6 overflow-hidden"
    >
      <div 
        onClick={onClick}
        className="glass border-red/30 bg-red/5 p-3 flex items-center justify-between cursor-pointer hover:bg-red/10 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red pulse-ring" />
          <span className="font-orbitron text-[11px] font-bold text-red tracking-[0.2em]">
            SYSTEM ALERT: NEURAL LINK INTERRUPTED
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-red/60 group-hover:text-red transition-colors">
            EXECUTE INITIALIZATION PROTOCOL
          </span>
          <span className="text-red">▶</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const { status, anomalies, prediction, aiData, history, online, isEnrolled, refresh } = useMetrics();
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'guidelines'

  return (
    <div className="bg-neural" style={{ minHeight: '100vh', position: 'relative' }}>
      <ParticleBackground />

      <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', zIndex: 9999, fontSize: 10 }}>CFA DEBUG: ENROLLED={String(isEnrolled)}</div>

      {!isEnrolled && <EnrollmentModal onEnrolled={refresh} />}

      {/* Main content layer */}
      <div style={{ position: 'relative', zIndex: 1, padding: '16px 20px', maxWidth: 1600, margin: '0 auto', opacity: isEnrolled ? 1 : 0.3, filter: isEnrolled ? 'none' : 'blur(4px)', pointerEvents: isEnrolled ? 'auto' : 'none', transition: 'all 0.8s ease' }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-6">
            <div>
              <h1 className="font-orbitron font-black" style={{ fontSize: 22, color: 'var(--violet-200)', letterSpacing: '0.08em' }}>
                ⚛ COGNITIVE FIELD ANALYZER
              </h1>
              <p className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.15em' }}>
                CSPU v1.0 · DEVICE:{status.deviceId?.substring(0, 12) ?? 'CFA-DEMO'}···
              </p>
            </div>
            
            <button 
              onClick={() => setView(v => v === 'dashboard' ? 'guidelines' : 'dashboard')}
              className="px-4 py-1.5 rounded border border-violet-500/20 text-[10px] font-mono hover:bg-violet-500/10 transition-all tracking-widest text-violet-400"
            >
              {view === 'dashboard' ? '◈ HELP / GUIDES' : '◈ DASHBOARD'}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <StatusDot active={online.java} label="JAVA AGENT" />
              <StatusDot active={online.ai}   label="AI ENGINE" />
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>NEXT PREDICTED CSI</span>
              <span className="font-orbitron font-bold" style={{ fontSize: 16, color: prediction.trend === 'IMPROVING' ? '#10B981' : prediction.trend === 'DEGRADING' ? '#EF4444' : '#A78BFA' }}>
                {prediction.nextCSI?.toFixed(1) ?? '—'}
                <span style={{ fontSize: 9, marginLeft: 4 }}>▶ {prediction.trend}</span>
              </span>
            </div>
          </div>
        </motion.header>

        <ConnectionAlert online={online} onClick={() => setView('guidelines')} />

        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {/* ── Main Grid ─────────────────────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 16, alignItems: 'start' }}>

                {/* ── Column 1: GCS Dial & Tools ──── */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <GlobalCognitiveDial
                    gcs={status.gcs}
                    bayesian={status.bayesian}
                  />

                  <APIManagement 
                    history={history}
                    onDownloadWiFi={() => downloadWiFiReport(history)}
                    onDownloadBT={() => downloadBluetoothReport(history)}
                  />
                </motion.div>

                {/* ── Column 2: Center panels ──── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {/* CSI Meters row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <CSIMeter label="WiFi CSI"       type="wifi"    value={status.wifiCSI ?? 65} subtitle={`RSSI ~${status.wifiRssi?.toFixed(0) ?? '-65'} dBm`} />
                    <CSIMeter label="Bluetooth CSI"  type="bt"      value={status.btCSI   ?? 55} subtitle={`${status.btDeviceCount ?? 0} devices`} />
                    <CSIMeter label="Network CSI"    type="network" value={status.netCSI  ?? 70} subtitle="packet quality" />
                    <CSIMeter label="System CSI"     type="system"  value={status.sysCSI  ?? 75} subtitle="CPU + Memory" />
                  </div>

                  {/* Entropy graph */}
                  <NetworkEntropyGraph history={history} />

                  {/* Spectrum analyzer */}
                  <SpectrumAnalyzer status={status} />
                </motion.div>

                {/* ── Column 3: Right panel ──── */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <AIInsightPanel aiData={aiData} forecast={prediction} />
                  <AnomalyAlerts  anomalies={anomalies} />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <Guidelines onBack={() => setView('dashboard')} />
          )}
        </AnimatePresence>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between mt-6 pt-4"
          style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}
        >
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
            ◈ Inspired by Nikola Tesla's analytical precision · CFA v1.0 · Pure Java + Python + React
          </span>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
            {new Date().toLocaleString('en-US', { hour12: false })}
          </span>
        </motion.footer>
      </div>
    </div>
  );
}
