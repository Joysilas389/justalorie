import { useState, useEffect } from 'react';
import { getFastingLogs, startFast, updateFastingLog } from '../services/api';
import { FASTING_SCHEDULES } from '../constants';
import { formatDate, formatTime } from '../utils/format';
import { useToast } from '../context/ToastContext';

export default function FastingTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState('SIXTEEN_EIGHT');
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState(new Date());
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFastingLogs({});
      setData(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const active = data?.activeFast;

  const handleStart = async () => {
    setStarting(true);
    try {
      await startFast({ schedule });
      addToast('Fast started!', 'success');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setStarting(false);
  };

  const handleComplete = async () => {
    if (!active) return;
    try {
      await updateFastingLog(active.id, { status: 'COMPLETED' });
      addToast('Fast completed!', 'success');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleCancel = async () => {
    if (!active) return;
    try {
      await updateFastingLog(active.id, { status: 'MISSED' });
      addToast('Fast cancelled', 'warning');
      load();
    } catch { }
  };

  // Live progress
  let liveProgress = 0;
  let liveElapsed = 0;
  let liveRemaining = 0;
  if (active) {
    liveElapsed = (now - new Date(active.startedAt)) / (1000 * 60 * 60);
    liveProgress = Math.min(100, (liveElapsed / active.targetHours) * 100);
    liveRemaining = Math.max(0, active.targetHours - liveElapsed);
  }

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-hourglass-split me-2"></i>Fasting Tracker</h5>

      {/* Active fast */}
      {active ? (
        <div className="card stat-card border-success mb-3">
          <div className="card-body text-center">
            <h6 className="fw-bold text-success"><i className="bi bi-hourglass me-1"></i>Fasting in Progress</h6>
            <div className="my-3">
              <div className="fs-2 fw-bold" style={{ color: '#6f42c1' }}>{formatDuration(liveElapsed)}</div>
              <small className="text-body-secondary">of {active.targetHours}h target</small>
            </div>
            <div className="progress mb-3" style={{ height: 12 }}>
              <div
                className={`progress-bar ${liveProgress >= 100 ? 'bg-success' : 'bg-warning'}`}
                style={{ width: `${liveProgress}%`, transition: 'width 1s linear' }}
              ></div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-4">
                <small className="text-body-secondary">Schedule</small>
                <div className="fw-bold">{active.schedule.replace('_', ':')}</div>
              </div>
              <div className="col-4">
                <small className="text-body-secondary">Started</small>
                <div className="fw-bold">{formatTime(active.startedAt)}</div>
              </div>
              <div className="col-4">
                <small className="text-body-secondary">Remaining</small>
                <div className="fw-bold">{liveRemaining > 0 ? formatDuration(liveRemaining) : 'Done!'}</div>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-success btn-sm" onClick={handleComplete}>
                <i className="bi bi-check-lg me-1"></i>Complete
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleCancel}>
                <i className="bi bi-x-lg me-1"></i>Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card stat-card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Start a Fast</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {FASTING_SCHEDULES.filter(s => s.value !== 'CUSTOM').map(s => (
                <button
                  key={s.value}
                  className={`btn btn-sm ${schedule === s.value ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setSchedule(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button className="btn btn-success w-100" onClick={handleStart} disabled={starting}>
              <i className="bi bi-play-fill me-1"></i>Start Fast
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-4">
          <div className="card stat-card text-center">
            <div className="card-body py-2">
              <div className="fs-4 fw-bold text-success">{data?.streak || 0}</div>
              <small className="text-body-secondary">Streak</small>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card stat-card text-center">
            <div className="card-body py-2">
              <div className="fs-4 fw-bold text-primary">
                {(data?.logs || []).filter(l => l.status === 'COMPLETED').length}
              </div>
              <small className="text-body-secondary">Completed</small>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card stat-card text-center">
            <div className="card-body py-2">
              <div className="fs-4 fw-bold text-warning">
                {(data?.logs || []).filter(l => l.status === 'MISSED').length}
              </div>
              <small className="text-body-secondary">Missed</small>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">Fasting History</div>
        <div className="list-group list-group-flush">
          {(data?.logs || []).length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No fasting history</p></div>
          ) : (
            (data?.logs || []).slice(0, 15).map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">{l.schedule.replace('_', ':')}</span>
                  <small className="text-body-secondary d-block">
                    {formatDate(l.startedAt)} · {formatTime(l.startedAt)}
                    {l.endedAt && ` → ${formatTime(l.endedAt)}`}
                  </small>
                </div>
                <span className={`badge bg-${l.status === 'COMPLETED' ? 'success' : l.status === 'ACTIVE' ? 'primary' : l.status === 'PARTIAL' ? 'warning' : 'danger'}`}>
                  {l.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
