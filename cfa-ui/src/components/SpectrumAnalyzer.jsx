/**
 * SpectrumAnalyzer.jsx
 * Animated bar chart showing system load spectrum (CPU, Memory, Network, BT).
 * Bars animate height continuously for a live "activity" feel.
 */

import { motion } from 'framer-motion';

const BARS = 16;

function mapToBars(value, count = BARS) {
  const active = Math.round((value / 100) * count);
  return Array.from({ length: count }, (_, i) => i < active);
}

function FrequencyBar({ active, index, color }) {
  const height = active
    ? 20 + Math.sin((Date.now() / 200 + index * 0.8)) * 8 + Math.random() * 12
    : 3 + Math.random() * 3;
  return (
    <motion.div
      animate={{ height }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        width: '100%',
        background: active ? color : 'rgba(124,58,237,0.1)',
        borderRadius: 2,
        boxShadow: active ? `0 0 8px ${color}66` : 'none',
        alignSelf: 'flex-end',
      }}
    />
  );
}

function Track({ label, value, color }) {
  const bars = mapToBars(value);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-orbitron font-bold" style={{ fontSize: 11, color }}>{value.toFixed(0)}%</span>
      </div>
      <div className="flex gap-0.5 items-end" style={{ height: 40 }}>
        {bars.map((active, i) => (
          <FrequencyBar key={i} active={active} index={i} color={color} />
        ))}
      </div>
    </div>
  );
}

export default function SpectrumAnalyzer({ status = {} }) {
  const cpu = status.cpuPercent ?? (status.sysCSI ? 100 - status.sysCSI * 0.8 : 35);
  const mem = status.memPercent ?? 45;

  return (
    <div className="glass p-4 flex flex-col gap-4">
      <p className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--violet-300)' }}>
        SYSTEM LOAD SPECTRUM
      </p>
      <Track label="CPU Load"    value={cpu}                  color="#F59E0B" />
      <Track label="Memory"      value={mem}                  color="#A78BFA" />
      <Track label="WiFi Signal" value={status.wifiCSI ?? 70} color="#22D3EE" />
      <Track label="BT Activity" value={status.btCSI ?? 55}   color="#8B5CF6" />
    </div>
  );
}
