/**
 * NetworkEntropyGraph.jsx
 * Recharts AreaChart showing real-time GCS and individual CSI scores over last 60 samples.
 */

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3" style={{ fontSize: 11 }}>
      {payload.map(p => (
        <div key={p.dataKey} className="flex gap-2 items-center">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span className="font-mono" style={{ color: p.color }}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function NetworkEntropyGraph({ history = [] }) {
  const data = history.map((h, i) => ({
    i,
    GCS: h.gcs,
    WiFi: h.wifiCSI,
    Net: h.netCSI,
    Sys: h.sysCSI,
  }));

  return (
    <div className="glass p-4 relative overflow-hidden" style={{ minHeight: 220 }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-orbitron text-xs tracking-widest" style={{ color: 'var(--violet-300)' }}>
          COGNITIVE SIGNAL TIMELINE
        </p>
        <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
          {history.length}/60 samples
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: -10, left: -20 }}>
          <defs>
            <linearGradient id="gradGCS"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#A78BFA" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradWiFi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNet"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-dim)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="GCS"  stroke="#A78BFA" fill="url(#gradGCS)"  strokeWidth={2} dot={false} name="GCS" />
          <Area type="monotone" dataKey="WiFi" stroke="#22D3EE" fill="url(#gradWiFi)" strokeWidth={1.5} dot={false} name="WiFi" />
          <Area type="monotone" dataKey="Net"  stroke="#10B981" fill="url(#gradNet)"  strokeWidth={1.5} dot={false} name="Network" />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
