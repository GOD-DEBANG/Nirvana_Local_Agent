/**
 * AIInsightPanel.jsx
 * Displays Gemini AI insight text with typewriter effect.
 * Shows adaptive weights as a visual bar chart.
 * Shows prediction trend and risk factor.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

function WeightBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-right flex-shrink-0" style={{ width: 50, fontSize: 10, color: 'var(--text-dim)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.12)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono flex-shrink-0" style={{ width: 32, fontSize: 10, color }}>{Math.round(value * 100)}%</span>
    </div>
  );
}

const RISK_COLORS = {
  WiFi: '#22D3EE', Bluetooth: '#A78BFA', Network: '#10B981', System: '#F59E0B', None: '#5C5080'
};

export default function AIInsightPanel({ aiData = {}, forecast = {} }) {
  const insight    = aiData.insight || 'Initializing cognitive analysis...';
  const weights    = aiData.weights || { wifi: 0.30, bt: 0.15, net: 0.35, sys: 0.20 };
  const riskFactor = aiData.risk_factor || 'None';
  const aiSource   = aiData.ai_source || 'offline';
  const confidence = aiData.ai_confidence || 0.5;

  // Typewriter effect
  const [displayed, setDisplayed] = useState('');
  const insightRef = useRef(insight);
  useEffect(() => {
    if (insight === insightRef.current && displayed.length === insight.length) return;
    insightRef.current = insight;
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(insight.slice(0, ++i));
      if (i >= insight.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [insight]);

  const trendColor = forecast.trend === 'IMPROVING' ? '#10B981' : forecast.trend === 'DEGRADING' ? '#EF4444' : '#A78BFA';

  return (
    <div className="glass p-4 flex flex-col gap-4" style={{ minHeight: 300 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--violet-300)' }}>
          🧠 GEMINI COGNITIVE ANALYSIS
        </p>
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{
            width: 6, height: 6,
            background: aiSource === 'gemini' ? '#10B981' : '#5C5080',
            boxShadow: aiSource === 'gemini' ? '0 0 6px #10B981' : 'none',
          }} />
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
            {aiSource.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Insight text with typewriter */}
      <div className="p-3 rounded-lg relative overflow-hidden" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', minHeight: 60 }}>
        <p className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {displayed}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ color: 'var(--violet-400)' }}
          >▋</motion.span>
        </p>
      </div>

      {/* Risk factor + Confidence */}
      <div className="flex gap-3">
        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: `${RISK_COLORS[riskFactor] || '#5C5080'}11`, border: `1px solid ${RISK_COLORS[riskFactor] || '#5C5080'}33` }}>
          <p className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>RISK FACTOR</p>
          <p className="font-orbitron font-bold mt-1" style={{ fontSize: 12, color: RISK_COLORS[riskFactor] || '#5C5080' }}>{riskFactor.toUpperCase()}</p>
        </div>
        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}>
          <p className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>AI CONFIDENCE</p>
          <p className="font-orbitron font-bold mt-1" style={{ fontSize: 12, color: 'var(--violet-300)' }}>{Math.round(confidence * 100)}%</p>
        </div>
        <div className="flex-1 p-2 rounded-lg text-center" style={{ background: `${trendColor}11`, border: `1px solid ${trendColor}33` }}>
          <p className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>TREND</p>
          <p className="font-orbitron font-bold mt-1" style={{ fontSize: 12, color: trendColor }}>{forecast.trend || 'STABLE'}</p>
        </div>
      </div>

      {/* Adaptive weights */}
      <div>
        <p className="font-orbitron text-xs mb-2" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-dim)' }}>ADAPTIVE WEIGHTS</p>
        <div className="flex flex-col gap-1.5">
          <WeightBar label="WiFi"    value={weights.wifi || 0.30} color="#22D3EE" />
          <WeightBar label="BT"      value={weights.bt   || 0.15} color="#A78BFA" />
          <WeightBar label="Network" value={weights.net  || 0.35} color="#10B981" />
          <WeightBar label="System"  value={weights.sys  || 0.20} color="#F59E0B" />
        </div>
      </div>
    </div>
  );
}
