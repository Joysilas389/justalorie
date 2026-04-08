import { useState, useEffect } from 'react';
import { getWaterLogs, createWaterLog, deleteWaterLog } from '../services/api';
import { formatDateKey, formatDate, formatTime } from '../utils/format';
import { useToast } from '../context/ToastContext';
import SimpleChart from '../components/charts/SimpleChart';

const PRESETS = [
  { label: '1 Glass', ml: 250, icon: 'bi-cup' },
  { label: '1 Sachet', ml: 500, icon: 'bi-droplet' },
  { label: '1 Bottle', ml: 750, icon: 'bi-water' },
  { label: '1 Cup', ml: 200, icon: 'bi-cup-hot' },
];

const DAILY_TARGET_ML = 2500; // ~10 glasses

export default function WaterTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [customMl, setCustomMl] = useState('');
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWaterLogs({
        startDate: formatDateKey(new Date(Date.now() - 30 * 86400000)),
        endDate: formatDateKey(),
      });
      setLogs(res.data.logs || []);
      setTodayTotal(res.data.todayTotal || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleQuickAdd = async (ml, source) => {
    try {
      await createWaterLog({ amountMl: ml, source });
      addToast(`${ml}ml logged! 💧`, 'success');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const handleCustomAdd = async () => {
    const ml = parseInt(customMl);
    if (!ml || ml <= 0) return;
    try {
      await createWaterLog({ amountMl: ml, source: 'custom' });
      addToast(`${ml}ml logged!`, 'success');
      setCustomMl('');
      load();
    } catch (err) {
      addToast(err.message, 'danger');
    }
  };

  const glasses = Math.round(todayTotal / 250 * 10) / 10;
  const pct = Math.min(100, Math.round((todayTotal / DAILY_TARGET_ML) * 100));

  // Chart data
  const dailyTotals = {};
  logs.forEach(l => {
    dailyTotals[l.localDateKey] = (dailyTotals[l.localDateKey] || 0) + l.amountMl;
  });
  const chartData = Object.entries(dailyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ml]) => ({ x: date, y: ml }));

  const todayLogs = logs.filter(l => l.localDateKey === formatDateKey());

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-droplet me-2"></i>Water Tracker</h5>

      {/* Today's progress */}
      <div className="card stat-card mb-3">
        <div className="card-body text-center">
          <div className="fs-1 fw-bold" style={{ color: '#0dcaf0' }}>
            💧 {todayTotal.toLocaleString()}ml
          </div>
          <small className="text-body-secondary">{glasses} glasses · Target: {DAILY_TARGET_ML / 250} glasses ({DAILY_TARGET_ML}ml)</small>
          <div className="progress mt-2" style={{ height: 12, borderRadius: 6 }}>
            <div
              className="progress-bar"
              style={{ width: `${pct}%`, backgroundColor: '#0dcaf0', transition: 'width 0.5s ease' }}
            ></div>
          </div>
          <small className="text-body-secondary mt-1 d-block">{pct}% of daily goal</small>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="card stat-card mb-3">
        <div className="card-body">
          <h6 className="fw-bold mb-2">Quick Add</h6>
          <div className="row g-2">
            {PRESETS.map(p => (
              <div key={p.label} className="col-6 col-md-3">
                <button
                  className="btn btn-outline-info w-100 py-2"
                  onClick={() => handleQuickAdd(p.ml, p.label.toLowerCase())}
                >
                  <i className={`bi ${p.icon} me-1`}></i>
                  <div className="fw-semibold">{p.label}</div>
                  <small>{p.ml}ml</small>
                </button>
              </div>
            ))}
          </div>
          <div className="input-group mt-3">
            <input
              type="number"
              className="form-control"
              placeholder="Custom amount (ml)"
              min="1"
              value={customMl}
              onChange={e => setCustomMl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomAdd()}
            />
            <span className="input-group-text">ml</span>
            <button className="btn btn-info text-white" onClick={handleCustomAdd}>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Water Intake Over Time</div>
          <div className="card-body">
            <SimpleChart data={chartData} color="#0dcaf0" label="ml" type="bar" />
          </div>
        </div>
      )}

      {/* Today's entries */}
      <div className="card stat-card">
        <div className="card-header bg-transparent fw-bold">Today's Entries</div>
        <div className="list-group list-group-flush">
          {loading ? (
            <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-info"></div></div>
          ) : todayLogs.length === 0 ? (
            <div className="empty-state py-3"><p className="mb-0">No water logged today</p></div>
          ) : (
            todayLogs.map(l => (
              <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-semibold">💧 {l.amountMl}ml</span>
                  <small className="text-body-secondary d-block">{l.source} · {formatTime(l.loggedAt)}</small>
                </div>
                <button className="btn btn-sm btn-outline-danger py-0" onClick={async () => {
                  await deleteWaterLog(l.id);
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
