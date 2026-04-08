import { useState, useEffect, useRef, useCallback } from 'react';

export function useHeartRateWs() {
  const [connected, setConnected] = useState(false);
  const [latestBpm, setLatestBpm] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const WS_BASE = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.host}`;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/heart-rate`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[WS] Connected to heart rate stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'heartRate' && msg.bpm) {
            setLatestBpm(msg.bpm);
            setDataPoints(prev => {
              const next = [...prev, { bpm: msg.bpm, time: msg.capturedAt || msg.timestamp }];
              return next.slice(-120); // Keep last 120 points (rolling window)
            });
          }
        } catch (e) { /* ignore */ }
      };

      ws.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
    }
  }, [WS_BASE]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const sendBpm = useCallback((bpm) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'heartRate', bpm }));
    }
  }, []);

  const clearPoints = useCallback(() => setDataPoints([]), []);

  useEffect(() => {
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { connected, latestBpm, dataPoints, connect, disconnect, sendBpm, clearPoints };
}
