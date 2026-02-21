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
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">SOURCE INSTALLATION</h3>
              <p className="text-text-secondary mb-3">
                Since Nirvana is your local private agent, you must point <b>pip</b> to its source folder to "wire" it into your system.
              </p>
              
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div className="text-text-dim border-b border-violet-500/10 pb-1 mb-1 text-[10px]">TERMINAL (RUN ONCE)</div>
                <div className="text-violet-400"># Point to where you downloaded the Nirvana_Local_Agent folder</div>
                <div>pip install "C:\Users\GOD.DEBANG\Desktop\Nirvana_Local_Agent"</div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">02</div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">VIRTUAL WORKSPACE</h3>
              <p className="text-text-secondary mb-3">
                Now you can create a fresh folder anywhere and activate your link.
              </p>
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div>mkdir my-nirvana</div>
                <div>cd my-nirvana</div>
                <div className="text-violet-400">.\.venv\Scripts\activate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="font-orbitron text-3xl font-bold text-violet-500/40">03</div>
            <div>
              <h3 className="font-orbitron text-lg font-bold text-violet-300 mb-2">ACTIVATE AGENT</h3>
              <p className="text-text-secondary mb-3">
                The <span className="text-cyan">nirvana-agent</span> command is now a global protocol. Launch it from your new folder.
              </p>
              <div className="bg-void/50 rounded-lg p-4 font-mono text-sm border border-violet-900/50 flex flex-col gap-2">
                <div className="text-cyan font-bold">nirvana-agent start</div>
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
