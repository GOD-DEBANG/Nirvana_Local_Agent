/**
 * GlobalCognitiveDial.jsx
 * Animated SVG arc dial showing the Global Cognitive Score (GCS).
 * Color shifts: green (>70) → amber (40-70) → red (<40).
 * Center number pulses on value change.
 */

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const SIZE   = 240;
const STROKE = 14;
const R      = (SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * R;

function scoreColor(v) {
  if (v >= 70) return '#10B981';
  if (v >= 40) return '#F59E0B';
  return '#EF4444';
}

function scoreLabel(v) {
  if (v >= 80) return 'OPTIMAL';
  if (v >= 60) return 'STABLE';
  if (v >= 40) return 'DEGRADED';
  return 'CRITICAL';
}

export default function GlobalCognitiveDial({ gcs = 65, bayesian = 0.8 }) {
  const spring = useSpring(gcs, { stiffness: 80, damping: 20 });
  const dashoffset = useTransform(spring, [0, 100], [CIRCUM, CIRCUM * 0.1]);
  const displayVal = useTransform(spring, v => Math.round(v));
  const color = scoreColor(gcs);

  useEffect(() => { spring.set(gcs); }, [gcs, spring]);

  return (
    <div className="glass flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ minHeight: 320 }}>
      {/* Scan line */}
      <div className="scan-anim" style={{ position: 'absolute', inset: 0, borderRadius: 16 }} />

      <p className="font-orbitron text-xs tracking-[0.25em] text-violet-400 mb-4 uppercase">
        Global Cognitive Score
      </p>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-220deg)' }}>
          {/* Background track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="rgba(124,58,237,0.12)"
            strokeWidth={STROKE}
            strokeDasharray={`${CIRCUM * 0.75} ${CIRCUM * 0.25}`}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gcs-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          {/* Animated arc */}
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="url(#gcs-grad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUM * 0.75} ${CIRCUM * 0.25}`}
            style={{ strokeDashoffset: dashoffset }}
            filter="url(#glow)"
          />
          {/* SVG glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center text */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.span
            className="font-orbitron font-bold"
            style={{ fontSize: 52, color, lineHeight: 1 }}
          >
            {displayVal}
          </motion.span>
          <span className="font-mono text-xs mt-1" style={{ color }}>/ 100</span>
          <span className="font-orbitron text-xs mt-2 tracking-widest" style={{ color, textShadow: `0 0 12px ${color}` }}>
            {scoreLabel(gcs)}
          </span>
        </div>
      </div>

      {/* Bayesian confidence */}
      <div className="flex items-center gap-2 mt-4">
        <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>Bayesian Conf.</span>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ width: 100, background: 'rgba(124,58,237,0.15)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, var(--violet-500), ${color})` }}
            animate={{ width: `${bayesian * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="font-mono text-xs" style={{ color }}>
          {(bayesian * 100).toFixed(0)}%
        </span>
      </div>

      {/* Pulse ring when critical */}
      {gcs < 40 && (
        <div
          className="pulse-ring"
          style={{
            position: 'absolute', inset: 20,
            borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.4)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
