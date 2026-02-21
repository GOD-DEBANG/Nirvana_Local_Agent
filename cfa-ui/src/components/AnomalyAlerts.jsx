/**
 * AnomalyAlerts.jsx
 * Scrolling anomaly event feed with severity-coded glassmorphism cards.
 */

import { motion, AnimatePresence } from 'framer-motion';

const SEV_CONFIG = {
  HIGH:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   icon: '⚠' },
  MEDIUM: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  icon: '◈' },
  LOW:    { color: '#22D3EE', bg: 'rgba(34,211,238,0.08)',  icon: '◉' },
};

const TYPE_LABELS = {
  Z_SCORE:     'Z-SCORE DEVIATION',
  OSCILLATION: 'SIGNAL OSCILLATION',
  SPIKE:       'CSI SPIKE',
};

function fmt(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AnomalyAlerts({ anomalies = [] }) {
  const sorted = [...anomalies].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

  return (
    <div className="glass p-4 flex flex-col gap-3" style={{ minHeight: 280 }}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-orbitron text-xs tracking-widest" style={{ color: '#EF4444' }}>
          ⚡ ANOMALY EVENTS
        </p>
        <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 10 }}>
          {sorted.length} events
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 240 }}>
        <AnimatePresence mode="popLayout">
          {sorted.length === 0 && (
            <motion.div
              key="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center py-6"
            >
              <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                ✓ No anomalies detected
              </span>
            </motion.div>
          )}

          {sorted.map((evt, i) => {
            const cfg = SEV_CONFIG[evt.severity] || SEV_CONFIG.LOW;
            return (
              <motion.div
                key={`${evt.timestamp}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="p-2.5 rounded-lg flex gap-3 items-start"
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
              >
                <span style={{ color: cfg.color, fontSize: 14 }}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-orbitron" style={{ fontSize: 9, color: cfg.color, letterSpacing: '0.1em' }}>
                      {TYPE_LABELS[evt.type] || evt.type}
                    </span>
                    <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-dim)', flexShrink: 0 }}>
                      {fmt(evt.timestamp)}
                    </span>
                  </div>
                  <p className="font-mono truncate-1 mt-0.5" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {evt.message || `${evt.component} — value: ${evt.value?.toFixed(1)} | Z: ${evt.zScore?.toFixed(2)}`}
                  </p>
                </div>
                <span className="font-orbitron flex-shrink-0" style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: cfg.color + '22', color: cfg.color }}>
                  {evt.severity}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
