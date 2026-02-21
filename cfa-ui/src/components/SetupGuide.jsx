import React from 'react';
import { motion } from 'framer-motion';

export default function SetupGuide({ onProceed }) {
  return (
    <div className="fixed inset-0 z-[10000] bg-neural/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark glow-violet p-8 max-w-2xl w-full relative overflow-hidden"
      >
        <div className="scan-anim" />
        
        <div className="mb-8 text-center border-b border-violet-500/20 pb-6">
          <h2 className="font-orbitron text-2xl font-black text-violet-200 tracking-wider">
            ◈ INITIALIZATION PROTOCOL
          </h2>
          <p className="font-mono text-[10px] text-text-dim tracking-[0.2em] mt-2">
            REQUIRED: LOCAL AGENT LINKAGE
          </p>
        </div>

        <div className="space-y-8 mb-10">
          <section className="flex gap-4">
            <div className="font-orbitron text-2xl font-bold text-violet-500/30">01</div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-violet-300 mb-1">RUN THE AGENT</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Open your terminal and launch the Nirvana Agent. This is bridges your hardware sensors to this dashboard.
              </p>
              <div className="mt-2 bg-void/50 rounded p-3 font-mono text-xs border border-violet-900/50 text-cyan">
                nirvana-agent start
              </div>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="font-orbitron text-2xl font-bold text-violet-500/30">02</div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-violet-300 mb-1">VERIFY PORTS</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Ensure the agent is listening on <span className="text-violet-400">8765</span> and the AI engine on <span className="text-violet-400">8766</span>.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="font-orbitron text-2xl font-bold text-violet-500/30">03</div>
            <div>
              <h3 className="font-orbitron text-sm font-bold text-violet-300 mb-1">ZERO-TRUST ENROLLMENT</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Next, we will generate your secure Device Cognitive Signature (DCS) to authorize this terminal.
              </p>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onProceed}
            className="w-full py-4 glass-dark border-violet-500/50 hover:bg-violet-500/20 text-violet-100 font-orbitron font-bold text-xs tracking-[0.2em] transition-all"
          >
            I'VE STARTED THE AGENT · PROCEED TO VALIDATION
          </button>
          
          <p className="text-[10px] font-mono text-center text-text-dim uppercase tracking-widest">
            Identity verification follows this step
          </p>
        </div>
      </motion.div>
    </div>
  );
}
