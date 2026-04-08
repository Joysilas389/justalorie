import { useState, useEffect, useRef } from 'react';
import { startHeartRateSession, stopHeartRateSession, logHeartRate, getHeartRateLogs, getLiveHeartRate } from '../services/api';
import { useHeartRateWs } from '../hooks/useHeartRateWs';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime } from '../utils/format';
import LiveHeartRateChart from '../components/charts/LiveHeartRateChart';
import SimpleChart from '../components/charts/SimpleChart';

export default function HeartRateTracker() {
  const { connected, latestBpm, dataPoints, connect, disconnect, sendBpm, clearPoints } = useHeartRateWs();
  const [session, setSession] = useState(null);
  const [manualBpm, setManualBpm] = useState('');
  const [historicalLogs, setHistoricalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const simRef = useRef(null);
  const { addToast } = useToast();

  // Load historical data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getHeartRateLogs({}).catch(() => ({ data: { logs: [] } })),
      getLiveHeartRate().catch(() => ({ data: { isLive: false } })),
    ]).then(([logsRes, liveRes]) => {
      setHistoricalLogs(logsRes.data?.logs || []);
      if (liveRes.data?.isLive && liveRes.data?.session) {
        setSession(liveRes.data.session);
        connect();
      }
    }).finally(() => setLoading(false));

    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  const handleStartSession = async () => {
    try {
      const res = await startHeartRateSession({ sourceType: 'MANUAL', sessionLabel: 'Manual Session' });
      setSession(res.data);
      clearPoints();
      connect();
      addToast('Heart rate session started', 'success');
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleStopSession = async () => {
    if (session) {
      try {
        await stopHeartRateSession(session.id);
        setSession(null);
        disconnect();
        stopSimulation();
        addToast('Session stopped', 'success');
        // Reload history
        const res = await getHeartRateLogs({});
        setHistoricalLogs(res.data?.logs || []);
      } catch (err) {
        addToast(err.message, 'danger');
      }
    }
  };

  const handleManualLog = async () => {
    const bpm = parseInt(manualBpm);
    if (isNaN(bpm) || bpm < 30 || bpm > 250) {
      addToast('BPM must be between 30 and 250', 'warning');
      return;
    }
    try {
      await logHeartRate({ bpm, sessionId: session?.id, sourceType: 'MANUAL' });
      setManualBpm('');
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  // Simulation mode for development/demo
  const startSimulation = () => {
    if (!session) return;
    setSimulating(true);
    let baseBpm = 72;
    simRef.current = setInterval(async () => {
      // Simulate realistic heart rate variation
      const variation = Math.floor(Math.random() * 15) - 5;
      baseBpm = Math.max(55, Math.min(140, baseBpm + variation));
      try {
        await logHeartRate({ bpm: baseBpm, sessionId: session?.id, sourceType: 'SIMULATED' });
      } catch { /* ignore */ }
    }, 2000);
  };

  const stopSimulation = () => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
    setSimulating(false);
  };

  // Historical chart data
  const histChartData = historicalLogs
    .slice()
    .reverse()
    .slice(-50)
    .map(l => ({ x: l.capturedAt, y: l.bpm }));

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-heart-pulse me-2"></i>Heart Rate Tracker</h5>

      {/* Live BPM display */}
      <div className="card stat-card mb-3">
        <div className="card-body text-center">
          <div className="mb-2">
            {connected ? (
              <span className="badge bg-success"><i className="bi bi-broadcast me-1"></i>Live Connected</span>
            ) : (
              <span className="badge bg-secondary">Offline</span>
            )}
          </div>
          <div className="fs-1 fw-bold">
            <i className={`bi bi-heart-pulse ${session ? 'hr-pulse' : 'text-danger'} me-2`}></i>
            {latestBpm || '—'}
          </div>
          <small className="text-body-secondary">BPM</small>
        </div>
      </div>

      {/* Session controls */}
      <div className="card stat-card mb-3">
        <div className="card-body">
          {!session ? (
            <button className="btn btn-success w-100" onClick={handleStartSession}>
              <i className="bi bi-play-fill me-1"></i>Start Heart Rate Session
            </button>
          ) : (
            <div>
              <div className="d-flex gap-2 mb-3">
                <button className="btn btn-danger flex-fill" onClick={handleStopSession}>
                  <i className="bi bi-stop-fill me-1"></i>Stop Session
                </button>
                {!simulating ? (
                  <button className="btn btn-outline-warning flex-fill" onClick={startSimulation}>
                    <i className="bi bi-activity me-1"></i>Simulate
                  </button>
                ) : (
                  <button className="btn btn-warning flex-fill" onClick={stopSimulation}>
                    <i className="bi bi-pause-fill me-1"></i>Stop Sim
                  </button>
                )}
              </div>

              {/* Manual BPM entry */}
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Manual BPM..."
                  min="30"
                  max="250"
                  value={manualBpm}
                  onChange={e => setManualBpm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualLog()}
                />
                <button className="btn btn-outline-success" onClick={handleManualLog}>Log</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live chart */}
      {dataPoints.length > 0 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold d-flex justify-content-between">
            <span><i className="bi bi-broadcast me-1 text-danger"></i>Live Heart Rate</span>
            <span className="badge bg-danger">{dataPoints.length} readings</span>
          </div>
          <div className="card-body">
            <LiveHeartRateChart dataPoints={dataPoints} />
          </div>
        </div>
      )}

      {/* Historical chart */}
      {histChartData.length > 0 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Historical Heart Rate</div>
          <div className="card-body">
            <SimpleChart data={histChartData} color="#dc3545" label="BPM" type="line" />
          </div>
        </div>
      )}

      {/* Recent readings */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">Recent Readings</div>
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-danger"></div></div>
          ) : historicalLogs.length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No heart rate data yet</p></div>
          ) : (
            historicalLogs.slice(0, 20).map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between">
                <div>
                  <span className="fw-semibold"><i className="bi bi-heart-fill text-danger me-1"></i>{l.bpm} BPM</span>
                  <small className="text-body-secondary d-block">{formatDate(l.capturedAt)} · {formatTime(l.capturedAt)}</small>
                </div>
                <span className={`badge bg-${l.sourceType === 'SIMULATED' ? 'warning' : l.sourceType === 'DEVICE' ? 'success' : 'primary'}`}>
                  {l.sourceType}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
