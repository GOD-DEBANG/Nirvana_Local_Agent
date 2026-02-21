/**
 * useMetrics.js — Central data polling hook.
 * Polls Java agent every 2 seconds for live CSI/GCS data.
 * Polls Python AI every 10 seconds for adaptive insight.
 * Falls back to mock data when services are offline.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchStatus, fetchAnomalies, fetchPrediction, postWeights,
  analyzeWithAI, getMockStatus, getMockAnomalies, getMockAI
} from '../api';

export default function useMetrics() {
  const [isEnrolled, setIsEnrolled] = useState(!!localStorage.getItem('cfa_api_key'));
  const [status, setStatus]     = useState(getMockStatus());
  const [anomalies, setAnomalies] = useState([]);
  const [prediction, setPrediction] = useState({ nextCSI: 65, trend: 'STABLE', decayLambda: 0, timeToThreshold: 9999 });
  const [aiData, setAiData]     = useState(getMockAI());
  const [history, setHistory]   = useState([]);   
  const [online, setOnline]     = useState({ java: false, ai: false });

  const refresh = useCallback(() => {
    setIsEnrolled(!!localStorage.getItem('cfa_api_key'));
  }, []);

  const addToHistory = useCallback((snap) => {
    setHistory(prev => {
      const next = [...prev, { ts: Date.now(), gcs: snap.gcs, wifiCSI: snap.wifiCSI, btCSI: snap.btCSI, netCSI: snap.netCSI, sysCSI: snap.sysCSI }];
      return next.length > 60 ? next.slice(next.length - 60) : next;
    });
  }, []);

  const pollJava = useCallback(async () => {
    if (!localStorage.getItem('cfa_api_key')) return;
    try {
      const [s, a, p] = await Promise.all([
        fetchStatus(),
        fetchAnomalies(),
        fetchPrediction()
      ]);
      setStatus({ ...s, isMock: false });
      setAnomalies(a);
      setPrediction(p);
      setOnline(prev => ({ ...prev, java: true }));
      addToHistory(s);
    } catch {
      const mock = getMockStatus();
      setStatus({ ...mock, isMock: true });
      setAnomalies(getMockAnomalies());
      setOnline(prev => ({ ...prev, java: false }));
      addToHistory(mock);
    }
  }, [addToHistory]);

  const pollAI = useCallback(async (currentStatus) => {
    if (!localStorage.getItem('cfa_api_key')) return;
    try {
      const result = await analyzeWithAI({
        rssi: currentStatus?.wifiRssi ?? -65,
        latency_ms: currentStatus?.latencyMs ?? 20,
        packet_loss_ratio: 0,
        cpu_pct: 30,
        mem_pct: 50,
        bt_count: 1,
      });
      setAiData(result);
      if (result.weights) {
        postWeights(result.weights).catch(() => {});
      }
      setOnline(prev => ({ ...prev, ai: true }));
    } catch {
      setOnline(prev => ({ ...prev, ai: false }));
    }
  }, []);

  useEffect(() => {
    if (!isEnrolled) return;

    pollJava();
    pollAI(null);

    const javaInterval = setInterval(pollJava, 2000);
    const aiInterval = setInterval(() => {
      setStatus(current => {
        pollAI(current);
        return current;
      });
    }, 10000);

    return () => {
      clearInterval(javaInterval);
      clearInterval(aiInterval);
    };
  }, [pollJava, pollAI, isEnrolled]);

  return { status, anomalies, prediction, aiData, history, online, isEnrolled, refresh };
}
