import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFingerprint, computeEntropy, computeDCS } from '../utils/cryptoUtils';
import { enrollDevice, checkHealth } from '../api';

export default function EnrollmentModal({ onEnrolled }) {
  const [stage, setStage] = useState('idle'); // idle, analyzing, enrolling, success, error
  const [error, setError] = useState(null);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    // Background check to see if we can talk to localhost
    checkHealth().then(() => setIsLinked(true)).catch(() => setIsLinked(false));
  }, []);

  const startEnrollment = async () => {
    setStage('analyzing');
    setError(null);
    try {
      // Test link first
      try {
        await checkHealth();
      } catch (err) {
        throw new Error("Cannot reach Local Agent. Did you 'Allow Insecure Content' and refresh?");
      }

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
        <h2 className="font-orbitron text-xl font-bold mb-6 tracking-widest text-violet-200 uppercase">
          Device Enrollment
        </h2>

        <div className="min-h-[160px] flex flex-col items-center justify-center">
            {stage === 'idle' && (
              <div>
                <p className="text-violet-300 font-mono text-xs mb-6 leading-relaxed">
                  Initialize Zero-Trust handshake to generate your unique Device Signature.
                </p>
                
                {window.location.protocol === 'https:' && !isLinked && (
                  <div className="mb-6 p-4 border border-amber-500/30 bg-amber-500/5 rounded text-[10px] text-amber-500 font-mono text-left space-y-2">
                    <p className="font-bold underline">⚠️ ACTION REQUIRED (NETLIFY HTTPS):</p>
                    <p>1. Chrome says "Insecure material" is blocked. You ALREADY allowed it in settings.</p>
                    <p>2. Now you MUST <b>Refresh this page</b> to apply the settings.</p>
                    <p>3. If still blocked, check if <b>nirvana-agent</b> is running in terminal.</p>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-500/10 mt-2">
                       <span>Link Status:</span>
                       <span className="text-rose-500 font-bold">OFFLINE</span>
                    </div>
                  </div>
                )}

                {isLinked && (
                  <div className="mb-6 p-2 border border-emerald-500/30 bg-emerald-500/5 rounded text-[10px] text-emerald-500 font-mono flex items-center justify-between">
                    <span>◈ NEURAL LINK:</span>
                    <span className="font-bold">ESTABLISHED</span>
                  </div>
                )}

                <button 
                  onClick={startEnrollment}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-orbitron text-xs tracking-widest transition-all rounded w-full active:scale-95 shadow-lg shadow-violet-500/20"
                >
                  INITIALIZE SIGNATURE
                </button>
              </div>
            )}

            {(stage === 'analyzing' || stage === 'enrolling') && (
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 mb-6">
                  <div className="absolute inset-0 border-2 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin" />
                </div>
                <p className="font-mono text-[10px] text-plasma animate-pulse tracking-widest uppercase text-center px-4">
                  {stage === 'analyzing' ? 'Analyzing Signature...' : 'Communicating with local agent...'}
                </p>
              </div>
            )}

            {stage === 'success' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-orbitron text-emerald-400 text-sm tracking-widest">VALIDATED</p>
              </div>
            )}

            {stage === 'error' && (
              <div className="flex flex-col items-center">
                <div className="text-rose-400 mb-6 font-mono text-[10px] text-center border border-rose-500/20 p-4 bg-rose-500/5 rounded leading-relaxed">
                   <div className="font-bold mb-1 underline text-rose-500">ENROLLMENT ERROR</div>
                  {error}
                </div>
                <button 
                  onClick={() => setStage('idle')}
                  className="px-6 py-2 border border-violet-500/30 text-xs font-mono text-violet-400 hover:text-white hover:bg-violet-500/10 rounded transition-all"
                >
                  ◀ BACK / RETRY
                </button>
              </div>
            )}
        </div>

        <div className="mt-8 pt-6 border-t border-violet-500/10 flex justify-between items-center opacity-40">
          <span className="font-mono text-[9px] text-dim">HANDSHAKE: HMAC-SHA256</span>
          <span className="font-mono text-[9px] text-dim uppercase">Status: {isLinked ? 'Linked' : 'Disconnected'}</span>
        </div>
      </motion.div>
    </div>
  );
}
