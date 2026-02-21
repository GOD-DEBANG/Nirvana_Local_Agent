import React from 'react';
import { motion } from 'framer-motion';

export default function Guidelines({ onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-dark glow-violet p-8 max-w-4xl mx-auto mt-10"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div className="scan-anim" />
      
      <div className="flex justify-between items-center mb-8 border-b border-violet-500/20 pb-4">
        <div>
          <h2 className="font-orbitron text-2xl font-black text-violet-200 tracking-wider">
            ◈ AGENT DEPLOYMENT GUIDELINES
          </h2>
          <p className="font-mono text-[10px] text-text-dim tracking-[0.2em] mt-1">
            PROTOCOL: LOCAL_RUNTIME_INIT · VERSION 1.0
          </p>
        </div>
        <button
          onClick={onBack}
          className="font-mono text-xs px-4 py-2 rounded-full border border-violet-500/30 hover:bg-violet-500/10 transition-colors text-violet-300"
        >
          BACK TO DASHBOARD
        </button>
      </div>

      <div className="grid gap-8">
        {/* Step 1 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">01</div>
            <div className="flex-1">
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">WORKSPACE ANALYTICS</h3>
              <p className="text-text-secondary mb-3">
                Initialize a dedicated workspace for the Nirvana runtime sequence.
              </p>
              
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div className="text-text-dim border-b border-violet-500/10 pb-1 mb-1 text-[10px]">TERMINAL (INITIALIZATION)</div>
                <div>mkdir my-nirvana-agent</div>
                <div>cd my-nirvana-agent</div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">02</div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">ENVIRONMENT ACTIVATION</h3>
              <p className="text-text-secondary mb-3">
                Generate and activate your Neural Virtual Environment to isolate dependencies.
              </p>
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-dim">WINDOWS</span>
                  <div>python -m venv .venv</div>
                  <div className="text-violet-400">.\.venv\Scripts\activate</div>
                </div>
                <div className="border-t border-violet-500/10 pt-2 flex flex-col gap-1">
                  <span className="text-[10px] text-text-dim">MAC / LINUX</span>
                  <div>python3 -m venv .venv</div>
                  <div className="text-violet-400">source .venv/bin/activate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">03</div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">LAUNCH PROTOCOL</h3>
              <p className="text-text-secondary mb-3">
                Install and start the agent. The system will now begin local telemetry aggregation.
              </p>
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div className="text-violet-400"># Run once to install</div>
                <div>pip install nirvana-agent</div>
                <div className="border-t border-violet-500/10 pt-2 text-cyan">nirvana-agent start</div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">03</div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">VERIFICATION SEQUENCE</h3>
              <p className="text-text-secondary mb-3">
                Once running, the dashboard header should reflect <span className="text-green">ONLINE</span> status for both Java and AI subsystems.
              </p>
              <div className="flex gap-4">
                <div className="glass p-3 flex-1 flex flex-col items-center">
                  <span className="font-mono text-[9px] text-text-dim mb-1">JAVA PORT</span>
                  <span className="font-orbitron text-sm text-cyan">8765</span>
                </div>
                <div className="glass p-3 flex-1 flex flex-col items-center">
                  <span className="font-mono text-[9px] text-text-dim mb-1">AI PORT</span>
                  <span className="font-orbitron text-sm text-cyan">8766</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Note */}
        <div className="mt-4 p-4 rounded-lg bg-violet-900/10 border border-violet-500/10 italic text-sm text-text-secondary">
          <span className="text-violet-400 font-bold not-italic mr-2">NOTE:</span>
          If the dashboard shows "SERVICE OFFLINE", verify that no other process is utilizing the reserved ports and that your firewall allows local loopback traffic.
        </div>
      </div>
    </motion.div>
  );
}
