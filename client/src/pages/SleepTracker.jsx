import { useState, useEffect } from 'react';
import { getSleepLogs, createSleepLog, deleteSleepLog } from '../services/api';
import { formatDateKey, formatDate, formatTime } from '../utils/format';
import { useToast } from '../context/ToastContext';
import SimpleChart from '../components/charts/SimpleChart';

const QUALITY_LABELS = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
const QUALITY_EMOJIS = ['', '😫', '😴', '😐', '😊', '🌟'];

export default function SleepTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSleepLogs({
        startDate: formatDateKey(new Date(Date.now() - 30 * 86400000)),
        endDate: formatDateKey(),
      });
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bedtime || !wakeTime) {
      addToast('Please enter bedtime and wake time', 'warning');
      return;
    }
    setSaving(true);
    try {
      await createSleepLog({
        bedtime: new Date(bedtime).toISOString(),
        wakeTime: new Date(wakeTime).toISOString(),
        quality,
        note: note || null,
      });
      addToast('Sleep logged! 😴', 'success');
      setBedtime('');
      setWakeTime('');
      setQuality(3);
      setNote('');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setSaving(false);
  };

  const formatDuration = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  };

  // Chart data
  const chartData = (data?.logs || [])
    .slice().reverse()
    .map(l => ({ x: l.localDateKey, y: Math.round(l.durationMin / 60 * 10) / 10 }));

  const qualityData = (data?.logs || [])
    .slice().reverse()
    .map(l => ({ x: l.localDateKey, y: l.quality }));

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-moon-stars me-2"></i>Sleep Tracker</h5>

      {/* Log sleep */}
      <div className="card stat-card mb-3">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Log Sleep</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label small">Bedtime</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={bedtime}
                  onChange={e => setBedtime(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label small">Wake Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small">Sleep Quality</label>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    type="button"
                    className={`btn flex-fill ${quality === q ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setQuality(q)}
                  >
                    <div style={{ fontSize: '1.2rem' }}>{QUALITY_EMOJIS[q]}</div>
                    <small style={{ fontSize: '0.65rem' }}>{QUALITY_LABELS[q]}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Notes (optional)..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-moon me-1"></i>}
              Log Sleep
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="card stat-card bg-primary-subtle">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-primary">
                {data?.avgDurationMin ? formatDuration(data.avgDurationMin) : '—'}
              </div>
              <small className="text-body-secondary">Avg Sleep</small>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card stat-card bg-info-subtle">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-info">
                {data?.avgQuality ? `${data.avgQuality}/5` : '—'}
              </div>
              <small className="text-body-secondary">Avg Quality</small>
            </div>
          </div>
        </div>
      </div>

      {/* Last night */}
      {data?.latest && (
        <div className="card stat-card mb-3 border-primary">
          <div className="card-body">
            <h6 className="fw-bold">Last Night</h6>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{formatDuration(data.latest.durationMin)}</div>
                <small className="text-body-secondary">
                  {formatTime(data.latest.bedtime)} → {formatTime(data.latest.wakeTime)}
                </small>
              </div>
              <div className="text-end">
                <span style={{ fontSize: '1.5rem' }}>{QUALITY_EMOJIS[data.latest.quality]}</span>
                <small className="d-block text-body-secondary">{QUALITY_LABELS[data.latest.quality]}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duration chart */}
      {chartData.length > 1 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Sleep Duration (hours)</div>
          <div className="card-body">
            <SimpleChart data={chartData} color="#6f42c1" label="Hours" type="bar" />
          </div>
        </div>
      )}

      {/* Quality chart */}
      {qualityData.length > 1 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Sleep Quality Trend</div>
          <div className="card-body">
            <SimpleChart data={qualityData} color="#0d6efd" label="Quality" type="line" />
          </div>
        </div>
      )}

      {/* History */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">Sleep History</div>
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>
          ) : (data?.logs || []).length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No sleep logged yet</p></div>
          ) : (
            (data?.logs || []).slice(0, 15).map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">{formatDuration(l.durationMin)}</span>
                  <small className="text-body-secondary d-block">
                    {formatDate(l.bedtime)} · {formatTime(l.bedtime)} → {formatTime(l.wakeTime)}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span>{QUALITY_EMOJIS[l.quality]}</span>
                  <button className="btn btn-sm btn-outline-danger py-0" onClick={async () => {
                    await deleteSleepLog(l.id);
                    addToast('Deleted', 'success');
                    load();
                  }}><i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
