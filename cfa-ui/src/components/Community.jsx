/**
 * Community.jsx — The Global Field Network
 * A collaborative intelligence hub for Nirvana users.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ─────────────────────────────────────────────────────────────────────

const DISCUSSIONS = [
  {
    id: 1, trending: true,
    title: 'Shannon Entropy spikes during peak hours — interference pattern or congestion?',
    author: 'field_analyst_ko', badge: 'Entropy Hunter', avatar: '📡',
    csiTag: 'CSI < 50', csiColor: '#EF4444',
    entropyLevel: 'HIGH', entropyColor: '#EF4444',
    type: 'WiFi', location: 'Office',
    replies: 31, signals: 89, time: '14m ago',
    preview: 'My DCT energy readings shoot above 22 every day at 9–10 AM. The Z-score confirms it\'s anomalous, but is this spectrum congestion or a rogue AP?',
    tags: ['entropy', 'anomaly', 'office'],
  },
  {
    id: 2, trending: false,
    title: 'Mapping Bluetooth interference from smart home devices — methodology',
    author: 'signal_guardian_rz', badge: 'Signal Guardian', avatar: '🛡️',
    csiTag: 'CSI 65–80', csiColor: '#F59E0B',
    entropyLevel: 'MED', entropyColor: '#F59E0B',
    type: 'Bluetooth', location: 'Home',
    replies: 18, signals: 54, time: '1h ago',
    preview: 'Used 3 agent instances to triangulate where exactly my Zigbee mesh is bleeding into the 2.4GHz band. Here\'s the methodology and CSI before/after.',
    tags: ['bluetooth', 'smart-home', 'mapping'],
  },
  {
    id: 3, trending: true,
    title: 'Meeting Assurance score <40 even with 200Mbps connection — why?',
    author: 'remote_dev_px', badge: 'Field Analyst', avatar: '💻',
    csiTag: 'CSI < 40', csiColor: '#EF4444',
    entropyLevel: 'HIGH', entropyColor: '#EF4444',
    type: 'Mixed', location: 'Home',
    replies: 44, signals: 102, time: '2h ago',
    preview: 'Raw throughput is fine but variance is huge. Entropy graph looks like noise. Realized my neighbor\'s WiFi 6E is on overlapping channel. Evidence inside.',
    tags: ['meeting', 'jitter', 'channel-overlap'],
  },
  {
    id: 4, trending: false,
    title: 'Evil Twin detection: RSSI fingerprint divergence as early warning signal',
    author: 'sec_researcher_am', badge: 'Signal Guardian', avatar: '🔐',
    csiTag: 'CSI 70–85', csiColor: '#10B981',
    entropyLevel: 'LOW', entropyColor: '#22D3EE',
    type: 'WiFi', location: 'Public',
    replies: 27, signals: 134, time: '5h ago',
    preview: 'If a rogue AP is mimicking your SSID, its signal fingerprint will differ in stability variance. Here\'s a detection heuristic using 30-sample windows.',
    tags: ['security', 'rogue-ap', 'evil-twin'],
  },
  {
    id: 5, trending: false,
    title: 'Signal Variance as a human presence detector — experimental findings',
    author: 'field_analyst_vd', badge: 'Field Analyst', avatar: '🧪',
    csiTag: 'CSI 50–70', csiColor: '#F59E0B',
    entropyLevel: 'MED', entropyColor: '#F59E0B',
    type: 'Mixed', location: 'Home',
    replies: 19, signals: 76, time: '1d ago',
    preview: 'Running continuous variance monitoring. Sigma² spikes correlate 78% with physical movement across 3 rooms. No camera required. Dataset attached.',
    tags: ['presence', 'variance', 'experimental'],
  },
  {
    id: 6, trending: false,
    title: 'Adaptive Gemini weights stuck at default — not updating after 50+ samples',
    author: 'debug_king_pl', badge: 'Field Analyst', avatar: '🔧',
    csiTag: 'CSI N/A', csiColor: '#5C5080',
    entropyLevel: 'LOW', entropyColor: '#22D3EE',
    type: 'Mixed', location: 'Home',
    replies: 8, signals: 12, time: '2d ago',
    preview: 'The AI_CALL_EVERY throttle is set to 5 but weights seem to plateau quickly. Is the exponential smoothing alpha too low for dynamic environments?',
    tags: ['bug', 'gemini', 'weights'],
  },
];

const FIELD_REPORTS = [
  {
    id: 1, author: 'field_analyst_ko', avatar: '📡', location: 'Home Office · Bangalore',
    avgCSI: 74, entropyTrend: 'Improving', intDensity: 'Medium', variance: 0.024,
    devices: 12, period: 'Feb 2026', downloads: 43,
    sparkline: [72, 68, 71, 74, 76, 79, 74, 77, 80, 78, 76, 74],
  },
  {
    id: 2, author: 'signal_guardian_rz', avatar: '🛡️', location: 'Co-working Space · Berlin',
    avgCSI: 51, entropyTrend: 'Degrading', intDensity: 'High', variance: 0.071,
    devices: 38, period: 'Feb 2026', downloads: 28,
    sparkline: [60, 58, 55, 52, 48, 52, 50, 49, 51, 48, 50, 51],
  },
  {
    id: 3, author: 'remote_dev_px', avatar: '💻', location: 'Home · São Paulo',
    avgCSI: 87, entropyTrend: 'Stable', intDensity: 'Low', variance: 0.009,
    devices: 6, period: 'Feb 2026', downloads: 61,
    sparkline: [85, 86, 88, 87, 89, 88, 87, 86, 88, 87, 88, 87],
  },
];

const EXPERT_INSIGHTS = [
  {
    id: 1, icon: '⚡', author: 'Nirvana Core Team', badge: 'Core Engineer',
    title: 'Why Shannon Entropy is the Most Honest Signal Metric',
    desc: 'Speed tests lie. Entropy doesn\'t. This post explains how we use information-theoretic disorder to detect interference that throughput benchmarks completely miss — and why it\'s the foundation of the CSI formula.',
    readTime: '6 min', signals: 312,
  },
  {
    id: 2, icon: '🔬', author: 'Dr. field_analyst', badge: 'Community Moderator',
    title: 'Adaptive Weighting in Practice: When Gemini Changes Your CSI Score',
    desc: 'The AI weight optimizer isn\'t magic — it\'s a Bayesian-smoothed exponential moving average applied to Gemini\'s contextual recommendations. Here\'s the math and when to trust it.',
    readTime: '8 min', signals: 198,
  },
  {
    id: 3, icon: '🛡️', author: 'Nirvana Security Team', badge: 'Core Engineer',
    title: 'Detecting Evil Twin Hotspots Using CSI Fingerprint Divergence',
    desc: 'A legitimate AP has a predictable stability signature. A rogue one doesn\'t. We walk through how to use variance deltas and RSSI temporal consistency to detect impersonation attacks without deep packet inspection.',
    readTime: '10 min', signals: 267,
  },
];

const BADGES = {
  'Field Analyst': { color: '#22D3EE', icon: '📡', desc: '10+ contributions' },
  'Entropy Hunter': { color: '#F59E0B', icon: '🌀', desc: 'Expert in anomaly detection' },
  'Signal Guardian': { color: '#10B981', icon: '🛡️', desc: 'Security specialist' },
  'Core Engineer': { color: '#A78BFA', icon: '⚛️', desc: 'Nirvana core team' },
  'Community Moderator': { color: '#F59E0B', icon: '🔬', desc: 'Verified moderator' },
};

const FILTER_GROUPS = {
  Impact: ['All', 'CSI < 40', 'CSI 40–70', 'CSI > 70'],
  Type: ['All', 'WiFi', 'Bluetooth', 'Mixed'],
  Location: ['All', 'Home', 'Office', 'Public'],
  Entropy: ['All', 'LOW', 'MED', 'HIGH'],
};

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveCounter() {
  const [count, setCount] = useState(1247);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + (Math.random() > 0.5 ? 1 : -1)), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10B981' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#10B981' }} />
      </span>
      <span className="font-orbitron text-xs font-bold" style={{ color: '#10B981' }}>{count.toLocaleString()}</span>
      <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>AGENTS LIVE</span>
    </div>
  );
}

function Badge({ label }) {
  const b = BADGES[label] || { color: '#5C5080', icon: '⬡', desc: '' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-orbitron font-bold"
      style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}30` }}>
      {b.icon} {label}
    </span>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data);
  const norm = data.map(v => 1 - (v - min) / (max - min + 1));
  const w = 120, h = 32;
  const pts = data.map((_, i) => `${(i / (data.length - 1)) * w},${norm[i] * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinejoin="round" />
      <polyline fill={`${color}15`} stroke="none"
        points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

function DiscussionCard({ d, onClick }) {
  const [signaled, setSignaled] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124,58,237,0.12)' }}
      onClick={onClick}
      className="glass p-5 cursor-pointer transition-all relative overflow-hidden"
      style={{ border: d.trending ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(167,139,250,0.08)' }}
    >
      {d.trending && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)' }} />
      )}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base"
          style={{ background: 'rgba(124,58,237,0.1)' }}>
          {d.avatar}
        </div>
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {d.trending && (
              <span className="font-orbitron text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                ◎ TRENDING
              </span>
            )}
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${d.csiColor}15`, color: d.csiColor, border: `1px solid ${d.csiColor}30` }}>
              {d.csiTag}
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: `${d.entropyColor}15`, color: d.entropyColor, border: `1px solid ${d.entropyColor}30` }}>
              ENTROPY {d.entropyLevel}
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(167,139,250,0.08)', color: 'var(--text-dim)', border: '1px solid rgba(167,139,250,0.1)' }}>
              {d.type} · {d.location}
            </span>
          </div>
          {/* Title */}
          <h3 className="font-orbitron text-[13px] font-bold text-violet-100 mb-1 leading-snug">
            {d.title}
          </h3>
          {/* Preview */}
          <p className="font-mono text-[10px] leading-relaxed mb-3" style={{ color: 'var(--text-dim)' }}>
            {d.preview.length > 120 ? d.preview.slice(0, 120) + '…' : d.preview}
          </p>
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>by </span>
              <span className="font-mono text-[9px]" style={{ color: '#A78BFA' }}>{d.author}</span>
              <Badge label={d.badge} />
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>{d.time}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>💬 {d.replies}</span>
              <button
                onClick={e => { e.stopPropagation(); setSignaled(s => !s); }}
                className="flex items-center gap-1 font-mono text-[9px] font-bold transition-all"
                style={{ color: signaled ? '#10B981' : 'rgba(167,139,250,0.4)' }}
              >
                ↑ {signaled ? d.signals + 1 : d.signals} SIGNAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FieldReportCard({ r }) {
  const csiColor = r.avgCSI > 75 ? '#10B981' : r.avgCSI > 55 ? '#F59E0B' : '#EF4444';
  const sparkColor = r.entropyTrend === 'Improving' ? '#10B981' : r.entropyTrend === 'Degrading' ? '#EF4444' : '#A78BFA';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{r.avatar}</span>
          <div>
            <p className="font-orbitron text-[11px] font-bold" style={{ color: '#C4B5FD' }}>{r.author}</p>
            <p className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>{r.location} · {r.period}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Avg CSI</p>
          <p className="font-orbitron text-xl font-black" style={{ color: csiColor }}>{r.avgCSI}</p>
        </div>
      </div>

      <Sparkline data={r.sparkline} color={sparkColor} />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'ENTROPY', value: r.entropyTrend },
          { label: 'INTERFERENCE', value: r.intDensity },
          { label: 'VARIANCE σ²', value: r.variance.toFixed(3) },
        ].map(m => (
          <div key={m.label} className="p-2 rounded-lg text-center" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{m.label}</p>
            <p className="font-orbitron text-[11px] font-bold mt-0.5" style={{ color: '#A78BFA' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-1.5 rounded-lg font-orbitron text-[9px] font-bold tracking-wide text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
          COMPARE MY FIELD
        </button>
        <button className="px-4 py-1.5 rounded-lg font-mono text-[9px] transition-all hover:bg-violet-500/10"
          style={{ border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
          ↓ PDF
        </button>
      </div>
    </motion.div>
  );
}

function ExpertCard({ e }) {
  const [signaled, setSignaled] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl relative overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 0 24px rgba(124,58,237,0.08), inset 0 0 32px rgba(124,58,237,0.03)',
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)' }} />
      <div className="flex items-start gap-3">
        <span className="text-2xl">{e.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px]" style={{ color: '#A78BFA' }}>{e.author}</span>
            <Badge label={e.badge} />
            <span className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>{e.readTime} read</span>
          </div>
          <h3 className="font-orbitron text-[13px] font-bold text-violet-100 mb-2 leading-snug">{e.title}</h3>
          <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>{e.desc}</p>
          <div className="flex items-center gap-4 mt-3">
            <button onClick={() => setSignaled(s => !s)}
              className="flex items-center gap-1 font-mono text-[9px] font-bold transition-all"
              style={{ color: signaled ? '#10B981' : 'rgba(167,139,250,0.4)' }}>
              ↑ {signaled ? e.signals + 1 : e.signals} SIGNAL
            </button>
            <button className="font-mono text-[9px] transition-colors hover:text-violet-300" style={{ color: 'var(--text-dim)' }}>
              READ FULL ANALYSIS →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Community({ onBack }) {
  const [activeTab, setActiveTab] = useState('discussions');
  const [filters, setFilters] = useState({ Impact: 'All', Type: 'All', Location: 'All', Entropy: 'All' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '', type: 'WiFi', location: 'Home', csiTag: 'CSI N/A', entropyLevel: 'MED' });

  const allDiscussions = [...userPosts, ...DISCUSSIONS];
  const filtered = allDiscussions.filter(d => {
    if (filters.Impact !== 'All' && d.csiTag !== filters.Impact) return false;
    if (filters.Type !== 'All' && d.type !== filters.Type) return false;
    if (filters.Location !== 'All' && d.location !== filters.Location) return false;
    if (filters.Entropy !== 'All' && d.entropyLevel !== filters.Entropy) return false;
    return true;
  });

  const handlePost = () => {
    if (!newPost.title.trim()) return;
    setUserPosts(p => [{
      id: Date.now(), trending: false,
      title: newPost.title,
      author: 'you', badge: 'Field Analyst', avatar: '🧑‍💻',
      csiTag: newPost.csiTag, csiColor: '#A78BFA',
      entropyLevel: newPost.entropyLevel, entropyColor: '#F59E0B',
      type: newPost.type, location: newPost.location,
      replies: 0, signals: 0, time: 'just now',
      preview: newPost.body,
      tags: [],
    }, ...p]);
    setNewPost({ title: '', body: '', type: 'WiFi', location: 'Home', csiTag: 'CSI N/A', entropyLevel: 'MED' });
    setShowNewPost(false);
  };

  const TABS = [
    { id: 'discussions', label: 'DISCUSSIONS', count: allDiscussions.length },
    { id: 'reports', label: 'FIELD REPORTS', count: FIELD_REPORTS.length },
    { id: 'insights', label: 'EXPERT INSIGHTS', count: EXPERT_INSIGHTS.length },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto pb-16">

      {/* ── Hero ─── */}
      <div className="relative mb-10 pt-2">
        {/* Ambient BG */}
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-mono text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: 'var(--text-dim)' }}
            >
              ◈ NIRVANA GLOBAL NETWORK · OPEN INTELLIGENCE
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-orbitron font-black tracking-tight mb-3"
              style={{ fontSize: 28, color: '#C4B5FD' }}
            >
              The Global Field Network
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-sm leading-relaxed max-w-2xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              Where engineers, researchers, remote workers, and IT teams discuss signal entropy, WiFi stability,
              Bluetooth interference, and CSI dynamics. Not just a forum — a <span style={{ color: '#A78BFA' }}>collaborative intelligence layer</span> built on shared field telemetry.
            </motion.p>
          </div>
          <button onClick={onBack}
            className="ml-6 font-mono text-xs px-4 py-2 rounded-full transition-colors hover:bg-violet-500/10"
            style={{ border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA', flexShrink: 0 }}>
            ← DASHBOARD
          </button>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center gap-6 mt-5 pt-4"
          style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}
        >
          <LiveCounter />
          {[
            { label: 'DISCUSSIONS', value: allDiscussions.length },
            { label: 'FIELD REPORTS', value: '2.1k' },
            { label: 'SOLUTIONS', value: '892' },
            { label: 'AVG GLOBAL CSI', value: '68.4' },
          ].map(s => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-sm font-bold" style={{ color: '#C4B5FD' }}>{s.value}</span>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{s.label}</span>
            </div>
          ))}
          {/* Privacy badge */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ color: '#10B981', fontSize: 10 }}>🔒</span>
            <span className="font-mono text-[9px]" style={{ color: '#10B981' }}>All telemetry anonymized · Zero raw data exposure</span>
          </div>
        </motion.div>
      </div>

      {/* ── Tabs ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg font-orbitron text-[10px] font-bold tracking-wider transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: activeTab === tab.id ? '#C4B5FD' : 'var(--text-dim)',
                border: activeTab === tab.id ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
              }}
            >
              {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {activeTab === 'discussions' && (
          <button
            onClick={() => setShowNewPost(true)}
            className="px-5 py-2 rounded-lg font-orbitron text-[10px] font-bold tracking-widest text-white hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
          >
            + POST DISCUSSION
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── DISCUSSIONS TAB ─── */}
        {activeTab === 'discussions' && (
          <motion.div key="disc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-5 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)' }}>
              {Object.entries(FILTER_GROUPS).map(([group, opts]) => (
                <div key={group} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>By {group}:</span>
                  <div className="flex gap-1">
                    {opts.map(opt => (
                      <button key={opt}
                        onClick={() => setFilters(f => ({ ...f, [group]: opt }))}
                        className="font-mono text-[9px] px-2 py-0.5 rounded-full transition-all"
                        style={{
                          background: filters[group] === opt ? 'rgba(124,58,237,0.2)' : 'transparent',
                          color: filters[group] === opt ? '#C4B5FD' : 'var(--text-dim)',
                          border: `1px solid ${filters[group] === opt ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.1)'}`,
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {filtered.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}>
                    <DiscussionCard d={d} onClick={() => {}} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-orbitron text-lg" style={{ color: 'var(--text-dim)' }}>No discussions match your filters.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── FIELD REPORTS TAB ─── */}
        {activeTab === 'reports' && (
          <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4 p-4 rounded-xl flex items-center gap-4" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}>
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-orbitron text-sm font-bold" style={{ color: '#22D3EE' }}>Anonymized Signal Environment Reports</p>
                <p className="font-mono text-[10px] leading-relaxed mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  All reports are generated from Local Agent telemetry with identifying data stripped. No IP addresses, device names, or precise location data are retained. You control what you share.
                </p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {FIELD_REPORTS.map(r => <FieldReportCard key={r.id} r={r} />)}
            </div>
          </motion.div>
        )}

        {/* ─── EXPERT INSIGHTS TAB ─── */}
        {activeTab === 'insights' && (
          <motion.div key="ins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <div className="mb-2 p-4 rounded-xl flex items-center gap-4" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <span className="text-2xl">⚛️</span>
              <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                Curated deep-dives from Nirvana core engineers and verified community researchers. Covering signal physics, AI methodology, security research, and field optimization.
              </p>
            </div>
            {EXPERT_INSIGHTS.map(e => <ExpertCard key={e.id} e={e} />)}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── New Post Modal ─── */}
      <AnimatePresence>
        {showNewPost && (
          <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="glass-dark max-w-lg w-full p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)' }} />
              <h3 className="font-orbitron text-lg font-bold mb-1" style={{ color: '#C4B5FD' }}>POST A DISCUSSION</h3>
              <p className="font-mono text-[9px] mb-6 tracking-widest" style={{ color: 'var(--text-dim)' }}>CONTRIBUTES TO THE GLOBAL FIELD NETWORK</p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'SIGNAL TYPE', key: 'type', opts: ['WiFi', 'Bluetooth', 'Mixed'] },
                    { label: 'LOCATION', key: 'location', opts: ['Home', 'Office', 'Public'] },
                    { label: 'CSI RANGE', key: 'csiTag', opts: ['CSI < 40', 'CSI 40–70', 'CSI > 70', 'CSI N/A'] },
                    { label: 'ENTROPY', key: 'entropyLevel', opts: ['LOW', 'MED', 'HIGH'] },
                  ].map(f => (
                    <div key={f.key} className="col-span-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest mb-1 block" style={{ color: '#A78BFA' }}>{f.label}</label>
                      <select value={newPost[f.key]} onChange={e => setNewPost(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full rounded-lg text-xs p-2 font-mono outline-none"
                        style={{ background: 'rgba(8,5,20,0.8)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD' }}>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest mb-1 block" style={{ color: '#A78BFA' }}>TITLE</label>
                  <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                    placeholder="What phenomenon are you observing?"
                    className="w-full rounded-lg text-xs p-3 font-mono outline-none"
                    style={{ background: 'rgba(8,5,20,0.8)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD' }}
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest mb-1 block" style={{ color: '#A78BFA' }}>FIELD NOTES</label>
                  <textarea value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))}
                    rows={4} placeholder="Share your CSI readings, entropy observations, or methodology..."
                    className="w-full rounded-lg text-xs p-3 font-mono outline-none resize-none"
                    style={{ background: 'rgba(8,5,20,0.8)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD' }}
                  />
                </div>
                <p className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  🔒 Your post will not include raw telemetry unless you explicitly paste it. All publications are voluntary.
                </p>
                <div className="flex gap-3 mt-1">
                  <button onClick={handlePost}
                    className="flex-1 py-2.5 rounded-lg font-orbitron text-[10px] font-bold text-white hover:brightness-110 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                    PUBLISH TO NETWORK
                  </button>
                  <button onClick={() => setShowNewPost(false)}
                    className="px-5 py-2.5 rounded-lg font-mono text-xs hover:bg-violet-500/10 transition-all"
                    style={{ border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
