import { useState, useEffect } from 'react';
import { getStepLogs, createStepLog, deleteStepLog } from '../services/api';
import { formatDateKey, formatDate, formatTime } from '../utils/format';
import { useToast } from '../context/ToastContext';
import SimpleChart from '../components/charts/SimpleChart';

export default function StepsTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getStepLogs({ startDate: formatDateKey(new Date(Date.now() - 30 * 86400000)), endDate: formatDateKey() });
      setLogs(res.data.logs || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!steps || parseInt(steps) <= 0) return;
    setSaving(true);
    try {
      await createStepLog({ steps: parseInt(steps) });
      addToast(`${steps} steps logged!`, 'success');
      setSteps('');
      loadLogs();
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setSaving(false);
  };

  // Group by day for chart
  const dailyTotals = {};
  logs.forEach(l => {
    dailyTotals[l.localDateKey] = (dailyTotals[l.localDateKey] || 0) + l.steps;
  });
  const chartData = Object.entries(dailyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, steps]) => ({ x: date, y: steps }));

  const todayKey = formatDateKey();
  const todayTotal = dailyTotals[todayKey] || 0;

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-person-walking me-2"></i>Steps Tracker</h5>

      {/* Add steps */}
      <div className="card stat-card mb-3">
        <div className="card-body">
          <form onSubmit={handleAdd} className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              placeholder="Enter steps..."
              min="1"
              value={steps}
              onChange={e => setSteps(e.target.value)}
            />
            <button className="btn btn-success" disabled={saving}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </form>
          <div className="row g-2 mt-2">
            {[1000, 2000, 5000].map(n => (
              <div key={n} className="col-4">
                <button className="btn btn-outline-success btn-sm w-100" onClick={() => setSteps(String(n))}>+{n.toLocaleString()}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today summary */}
      <div className="card stat-card bg-primary-subtle mb-3">
        <div className="card-body text-center py-3">
          <div className="fs-2 fw-bold text-primary">{todayTotal.toLocaleString()}</div>
          <small className="text-body-secondary">Steps today · Goal: 10,000</small>
          <div className="progress mt-2" style={{ height: 8 }}>
            <div className="progress-bar bg-primary" style={{ width: `${Math.min(100, (todayTotal / 10000) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Steps Over Time</div>
          <div className="card-body">
            <SimpleChart data={chartData} color="#0d6efd" label="Steps" type="bar" />
          </div>
        </div>
      )}

      {/* Recent logs */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">Recent Entries</div>
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>
          ) : logs.length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No steps logged yet</p></div>
          ) : (
            logs.slice(0, 15).map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">{l.steps.toLocaleString()} steps</span>
                  <small className="text-body-secondary d-block">{formatDate(l.loggedAt)} · {formatTime(l.loggedAt)}</small>
                </div>
                <button className="btn btn-sm btn-outline-danger py-0" onClick={async () => {
                  await deleteStepLog(l.id);
                  addToast('Deleted', 'success');
                  loadLogs();
                }}><i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
