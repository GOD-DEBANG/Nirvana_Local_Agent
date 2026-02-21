/**
 * EnrollmentModal.jsx — Zero-Trust Device Registration
 * Secure overlay for DCS generation and backend-issued API key retrieval.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFingerprint, computeEntropy, computeDCS } from '../utils/cryptoUtils';
import { enrollDevice } from '../api';

export default function EnrollmentModal({ onEnrolled }) {
  const [stage, setStage] = useState('idle'); // idle, analyzing, enrolling, success, error
  const [error, setError] = useState(null);

  const startEnrollment = async () => {
    setStage('analyzing');
    try {
      // 1. Collect non-sensitive metadata
      const fingerprint = await generateFingerprint();
      const entropy     = await computeEntropy();
      const timestamp   = Date.now();
      
      // 2. Compute DCS locally
      const dcs = await computeDCS(fingerprint, entropy, timestamp);

      setStage('enrolling');

      // 3. Secure POST request
      const response = await enrollDevice({
        deviceId: 'device_' + fingerprint.substring(0, 12),
        dcs,
        fingerprint,
        entropy,
        timestamp,
        meta: JSON.stringify({
          userAgent: navigator.userAgent,
          resolution: `${window.screen.width}x${window.screen.height}`,
          cores: navigator.hardwareConcurrency,
        })
      });

      // 4. Store backend-issued key
      localStorage.setItem('cfa_api_key', response.apiKey);
      localStorage.setItem('cfa_device_id', 'device_' + fingerprint.substring(0, 12));
      
      setStage('success');
      setTimeout(() => onEnrolled(), 1500);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Enrollment failed');
      setStage('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04020F]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 max-w-md w-full border border-violet-500/30 text-center"
      >
        <h2 className="font-orbitron text-xl font-bold mb-6 tracking-widest text-violet-200">
          SECURE DEVICE ENROLLMENT
        </h2>

        <div className="min-h-[160px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === 'idle' && (
              <motion.div key="idle" exit={{ opacity: 0 }}>
                <p className="text-dim font-mono text-sm mb-8 leading-relaxed">
                  This device is not yet registered. Initialize Zero-Trust 
                  handshake to generate a unique Device Cognitive Signature.
                </p>
                <button 
                  onClick={startEnrollment}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-orbitron text-xs tracking-widest transition-all rounded"
                >
                  INITIALIZE SIGNATURE
                </button>
              </motion.div>
            )}

            {(stage === 'analyzing' || stage === 'enrolling') && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-2 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-2 border-2 border-t-plasma border-r-transparent border-b-plasma border-l-transparent rounded-full"
                  />
                </div>
                <p className="font-mono text-xs text-plasma animate-pulse tracking-widest uppercase">
                  {stage === 'analyzing' ? 'Analyzing Device Signature...' : 'Verifying with Backend...'}
                </p>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-orbitron text-emerald-400 text-sm tracking-widest">VALIDATED</p>
              </motion.div>
            )}

            {stage === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }}>
                <div className="text-rose-500 mb-4 font-mono text-xs">
                  {error}
                </div>
                <button 
                  onClick={() => setStage('idle')}
                  className="text-xs font-mono text-violet-400 hover:text-white underline"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-6 border-t border-violet-500/10 flex justify-between items-center opacity-40">
          <span className="font-mono text-[9px] text-dim">HANDSHAKE: HMAC-SHA256</span>
          <span className="font-mono text-[9px] text-dim">GATEWAY: v1.02</span>
        </div>
      </motion.div>
    </div>
  );
}
