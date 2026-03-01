/**
 * SetupGuide.jsx
 * Step-by-step first-time setup guide shown before enrollment.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    icon: '📦',
    title: 'INSTALL THE AGENT',
    desc: 'Run this once to register the nirvana-agent command globally on your machine. Point pip directly to the source folder.',
    blocks: [
      {
        label: 'TERMINAL — RUN ONCE',
        lines: [
          'pip install "C:\\Users\\GOD.DEBANG\\Desktop\\Nirvana_Local_Agent"',
        ],
      },
    ],
  },
  {
    num: '02',
    icon: '📁',
    title: 'CREATE YOUR WORKSPACE',
    desc: 'Create a new folder, move into it, and activate the virtual environment that was set up inside the source folder.',
    blocks: [
      {
        label: 'TERMINAL',
        lines: [
          'mkdir my-nirvana',
          'cd my-nirvana',
          '.\\.venv\\Scripts\\activate',
        ],
      },
    ],
    note: 'The .venv folder lives inside the Nirvana_Local_Agent source folder. You activate it from there.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'START THE AGENT',
    desc: 'With the virtual environment active, launch the Nirvana Agent. It will start collecting WiFi, Bluetooth, and System telemetry.',
    blocks: [
      {
        label: 'TERMINAL (from your new workspace)',
        lines: [
          'nirvana-agent start',
        ],
      },
    ],
    note: 'Keep this terminal open while using the dashboard. The agent runs on port 8765.',
  },
];

function CodeBlock({ label, lines }) {
  const [copied, setCopied] = useState(false);
  const text = lines.filter(l => !l.startsWith('#') && l.trim()).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-violet-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-void/70 border-b border-violet-900/30">
        <span className="font-mono text-[9px] text-violet-400/70 uppercase tracking-widest">{label}</span>
        <button onClick={handleCopy} className="font-mono text-[9px] text-violet-400 hover:text-violet-200 transition-colors">
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <div className="bg-void/50 p-4 font-mono text-sm flex flex-col gap-1">
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.startsWith('#') ? 'var(--text-dim)' : 'var(--cyan)' }}>
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SetupGuide({ onProceed }) {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];
  const isLast = activeStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] bg-neural/95 backdrop-blur-xl flex overflow-hidden">

      {/* ── Sidebar ─── */}
      <div className="w-56 flex-shrink-0 border-r border-violet-500/10 p-6 flex flex-col gap-3">
        <div className="mb-4">
          <h1 className="font-orbitron font-black text-violet-200 text-sm tracking-wider">⚛ NIRVANA SETUP</h1>
          <p className="font-mono text-[9px] text-violet-400/40 tracking-widest mt-1">FIRST-TIME INITIALIZATION</p>
        </div>

        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className="flex items-center gap-3 p-2.5 rounded-lg text-left transition-all"
            style={{
              background: activeStep === i ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: `1px solid ${activeStep === i ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
            }}
          >
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="font-mono text-[9px]" style={{ color: activeStep === i ? '#C4B5FD' : 'var(--text-dim)' }}>
                STEP {s.num}
              </p>
              <p className="font-orbitron text-[10px] font-bold leading-tight" style={{ color: activeStep === i ? '#C4B5FD' : 'rgba(167,139,250,0.5)' }}>
                {s.title}
              </p>
            </div>
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-violet-500/10">
          <button
            onClick={onProceed}
            className="w-full py-3 rounded-lg text-xs font-orbitron font-bold tracking-widest text-violet-100 transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            SKIP TO ENROLLMENT →
          </button>
        </div>
      </div>

      {/* ── Main ─── */}
      <div className="flex-1 overflow-y-auto p-12 flex flex-col justify-center">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{step.icon}</span>
            <div>
              <p className="font-mono text-[10px] text-violet-400/50 tracking-[0.2em]">STEP {step.num} OF {STEPS.length}</p>
              <h2 className="font-orbitron text-2xl font-black text-violet-200 tracking-tight">{step.title}</h2>
            </div>
          </div>

          <p className="font-mono text-sm text-violet-300/80 leading-relaxed mb-6">
            {step.desc}
          </p>

          <div className="flex flex-col gap-4">
            {step.blocks.map((block, i) => (
              <CodeBlock key={i} label={block.label} lines={block.lines} />
            ))}
          </div>

          {step.note && (
            <div className="mt-4 p-3 rounded-lg bg-violet-900/10 border border-violet-500/10">
              <p className="font-mono text-[10px] text-violet-400/70 leading-relaxed">
                <span className="text-violet-400 font-bold mr-2">NOTE:</span>{step.note}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-10">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep(s => s - 1)}
                className="px-5 py-2 rounded-lg border border-violet-500/30 text-violet-300 font-mono text-xs hover:bg-violet-500/10 transition-all"
              >
                ← BACK
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setActiveStep(s => s + 1)}
                className="px-6 py-2 rounded-lg text-white font-orbitron text-xs font-bold hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
              >
                NEXT: {STEPS[activeStep + 1].title} →
              </button>
            ) : (
              <button
                onClick={onProceed}
                className="px-8 py-2 rounded-lg text-white font-orbitron text-xs font-bold hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              >
                ✓ AGENT RUNNING · PROCEED TO ENROLLMENT
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
