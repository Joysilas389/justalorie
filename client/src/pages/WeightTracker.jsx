import { useState, useEffect } from 'react';
import { getWeightLogs, createWeightLog, deleteWeightLog } from '../services/api';
import { formatDate, formatTime, formatWeight } from '../utils/format';
import { useToast } from '../context/ToastContext';
import SimpleChart from '../components/charts/SimpleChart';

export default function WeightTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWeightLogs({});
      setData(res.data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) return;
    setSaving(true);
    try {
      await createWeightLog({ weightKg: parseFloat(weight) });
      addToast('Weight logged!', 'success');
      setWeight('');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setSaving(false);
  };

  const chartData = (data?.logs || [])
    .slice()
    .reverse()
    .map(l => ({ x: l.localDateKey, y: l.weightKg }));

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-speedometer me-2"></i>Weight Tracker</h5>

      {/* Add weight */}
      <div className="card stat-card mb-3">
        <div className="card-body">
          <form onSubmit={handleAdd} className="d-flex gap-2">
            <div className="input-group">
              <input type="number" className="form-control" placeholder="Weight" step="0.1" min="20" value={weight} onChange={e => setWeight(e.target.value)} />
              <span className="input-group-text">kg</span>
            </div>
            <button className="btn btn-success" disabled={saving}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Current stats */}
      <div className="row g-3 mb-3">
        <div className="col-6">
          <div className="card stat-card bg-warning-subtle">
            <div className="card-body text-center py-3">
              <div className="fs-3 fw-bold text-warning">{data?.latest ? formatWeight(data.latest.weightKg) : '—'}</div>
              <small className="text-body-secondary">Latest</small>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className={`card stat-card ${data?.trend?.direction === 'losing' ? 'bg-success-subtle' : data?.trend?.direction === 'gaining' ? 'bg-danger-subtle' : 'bg-info-subtle'}`}>
            <div className="card-body text-center py-3">
              <div className="fs-4 fw-bold">
                {data?.trend ? (
                  <>{data.trend.changeKg > 0 ? '+' : ''}{data.trend.changeKg} kg</>
                ) : '—'}
              </div>
              <small className="text-body-secondary">{data?.trend?.direction || 'No trend yet'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Weight Trend</div>
          <div className="card-body">
            <SimpleChart data={chartData} color="#fd7e14" label="Weight (kg)" type="line" />
          </div>
        </div>
      )}

      {/* History */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">History</div>
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-warning"></div></div>
          ) : (data?.logs || []).length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No weight entries yet</p></div>
          ) : (
            data.logs.slice(0, 20).map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">{l.weightKg} kg</span>
                  <small className="text-body-secondary d-block">{formatDate(l.loggedAt)} · {formatTime(l.loggedAt)}</small>
                </div>
                <button className="btn btn-sm btn-outline-danger py-0" onClick={async () => {
                  await deleteWeightLog(l.id);
                  addToast('Deleted', 'success');
                  load();
                }}><i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
