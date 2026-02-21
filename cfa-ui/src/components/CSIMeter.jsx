/**
 * CSIMeter.jsx
 * Circular SVG progress ring for individual CSI components.
 * Used for WiFi, Bluetooth, Network, System CSI.
 */

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const SIZE   = 130;
const STROKE = 10;
const R      = (SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * R;

const ICONS = {
  wifi:    '📡',
  bt:      '🔵',
  network: '🌐',
  system:  '⚡',
};

function getColor(v) {
  if (v >= 70) return '#10B981';
  if (v >= 50) return '#22D3EE';
  if (v >= 35) return '#F59E0B';
  return '#EF4444';
}

export default function CSIMeter({ label, type = 'wifi', value = 65, subtitle = '' }) {
  const spring = useSpring(value, { stiffness: 70, damping: 18 });
  const dashoffset = useTransform(spring, [0, 100], [CIRCUM, 0]);
  const displayVal = useTransform(spring, v => Math.round(v));
  const color = getColor(value);

  useEffect(() => { spring.set(value); }, [value, spring]);

  return (
    <div className="glass flex flex-col items-center justify-center p-4 gap-2">
      <span style={{ fontSize: 20 }}>{ICONS[type] || '◎'}</span>
      <p className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="rgba(124,58,237,0.1)"
            strokeWidth={STROKE}
          />
          {/* Animated fill */}
          <defs>
            <linearGradient id={`csi-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={`url(#csi-grad-${type})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUM}
            style={{ strokeDashoffset: dashoffset }}
          />
        </svg>

        {/* Center */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.span
            className="font-orbitron font-bold"
            style={{ fontSize: 28, color, lineHeight: 1 }}
          >
            {displayVal}
          </motion.span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>/100</span>
        </div>
      </div>

      {subtitle && (
        <p className="font-mono text-center" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
          {subtitle}
        </p>
      )}

      {/* Status dot */}
      <div className="flex items-center gap-1.5">
        <div className="rounded-full" style={{ width: 6, height: 6, background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="font-mono" style={{ fontSize: 9, color }}>
          {value >= 70 ? 'NOMINAL' : value >= 40 ? 'DEGRADED' : 'CRITICAL'}
        </span>
      </div>
    </div>
  );
}
