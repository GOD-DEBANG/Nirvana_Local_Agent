/**
 * MeetingAssurance.jsx
 * Provides a 'pre-flight' stability check for online meetings.
 * Runs a 10-second high-resolution scan.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMeeting } from '../api';

export default function MeetingAssurance({ currentTelemetry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setResult(null);
    setError(null);

    // Simulated progress bar for 5 seconds (frontend wait)
    // plus the actual backend analysis
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      if (currentStep >= steps) clearInterval(timer);
    }, interval);

    try {
      const data = await analyzeMeeting(currentTelemetry);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsScanning(false);
      setProgress(100);
    }
  };

  const getScoreColor = (score) => {
    if (score > 85) return '#10B981';
    if (score > 65) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setResult(null); }}
        className="w-full p-3 rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-all group flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div className="text-left">
            <p className="font-orbitron text-[10px] font-bold text-violet-300 tracking-wider">MEETING ASSURANCE</p>
            <p className="font-mono text-[9px] text-violet-400/60">PRE-FLIGHT STABILITY CHECK</p>
          </div>
        </div>
        <span className="text-violet-400 group-hover:translate-x-1 transition-transform">▶</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-md w-full p-8 border-violet-500/40 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-violet-400/50 hover:text-violet-400 transition-colors font-mono text-xl"
              >
                ✕
              </button>

              <h2 className="font-orbitron text-lg font-black text-violet-200 mb-2 tracking-tighter">
                NEURAL STABILITY SCAN
              </h2>
              <p className="font-mono text-[10px] text-violet-400/60 mb-6 tracking-widest uppercase">
                Analyzing cognitive field jitter & entropy
              </p>

              {!isScanning && !result && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-dashed border-violet-500/40 flex items-center justify-center animate-spin-slow">
                    <span className="text-3xl">📡</span>
                  </div>
                  <p className="font-mono text-sm text-violet-300 mb-8 px-4">
                    Ready to analyze your environment for meeting-grade stability. This takes ~5 seconds.
                  </p>
                  <button
                    onClick={startScan}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-orbitron text-xs tracking-[0.2em] rounded-md shadow-lg shadow-violet-500/20 transition-all font-bold"
                  >
                    EXECUTE ANALYSIS
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="py-12 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64" cy="64" r="60"
                        stroke="rgba(124, 58, 237, 0.1)"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="64" cy="64" r="60"
                        stroke="#A78BFA"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="377"
                        animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-orbitron text-2xl font-bold text-violet-200">{Math.round(progress)}%</span>
                      <span className="font-mono text-[8px] text-violet-400 uppercase">Scanning</span>
                    </div>
                  </div>
                  <p className="font-mono text-[11px] text-violet-300 animate-pulse">
                     {progress < 30 ? 'INJECTING SIGNAL PROBE...' : 
                      progress < 70 ? 'CALCULATING ENTROPY VARIANCE...' : 
                      'FINALIZING NEURAL VERDICT...'}
                  </p>
                </div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4"
                >
                  <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <p className="font-mono text-[9px] text-violet-400">STABILITY SCORE</p>
                      <p className="font-orbitron text-3xl font-black" style={{ color: getScoreColor(result.score) }}>
                        {result.score}<span className="text-sm opacity-50 ml-1">%</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded text-[9px] font-bold font-orbitron mb-1`} style={{ background: `${getScoreColor(result.score)}22`, color: getScoreColor(result.score) }}>
                        {result.score > 85 ? 'OPTIMAL' : result.score > 65 ? 'GOOD' : result.score > 40 ? 'FAIR' : 'POOR'}
                      </div>
                      <p className="font-mono text-[10px] text-white/80">{result.verdict.split(':')[0]}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="p-3 rounded bg-violet-500/5 border-l-2 border-violet-500">
                      <p className="font-mono text-[11px] leading-relaxed text-violet-200">
                         {result.details}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded bg-black/20 border border-white/5">
                        <p className="font-mono text-[8px] text-violet-400 uppercase">JITTER</p>
                        <p className="font-orbitron text-xs text-white">{result.metrics.jitter.toFixed(3)}</p>
                      </div>
                      <div className="p-2 rounded bg-black/20 border border-white/5">
                        <p className="font-mono text-[8px] text-violet-400 uppercase">LATENCY</p>
                        <p className="font-orbitron text-xs text-white">{result.metrics.latency}ms</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 border border-violet-500/30 hover:bg-violet-500/10 text-violet-300 font-orbitron text-[10px] tracking-[0.2em] rounded-md transition-all uppercase"
                  >
                    DISMISS CONSOLE
                  </button>
                </motion.div>
              )}

              {error && (
                <div className="py-8 text-center">
                  <span className="text-4xl mb-4 block">⚠️</span>
                  <p className="font-mono text-sm text-red-400 mb-6">{error}</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 border border-red-500/30 text-red-400 font-mono text-xs rounded hover:bg-red-500/10"
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
