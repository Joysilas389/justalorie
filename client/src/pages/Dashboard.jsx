import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../services/api';
import { formatCalories, formatDate, formatTime } from '../utils/format';
import CalorieRing from '../components/dashboard/CalorieRing';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <i className="bi bi-exclamation-circle"></i>
        <p>Could not load dashboard. Is the backend running?</p>
      </div>
    );
  }

  const pct = data.dailyTarget > 0 ? Math.min(100, Math.round((data.caloriesConsumed / data.dailyTarget) * 100)) : 0;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0 fw-bold">Dashboard</h5>
          <small className="text-body-secondary">{dayjs().format('dddd, MMMM D, YYYY')}</small>
        </div>
        <Link to="/daily-log" className="btn btn-success btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Log Food
        </Link>
      </div>

      {/* Calorie overview */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card stat-card h-100">
            <div className="card-body text-center">
              <CalorieRing consumed={data.caloriesConsumed} target={data.dailyTarget} />
              <div className="mt-2 small text-body-secondary">
                {data.profile?.goal === 'LOSE' ? 'Deficit goal' : data.profile?.goal === 'GAIN' ? 'Surplus goal' : 'Maintenance'}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="row g-3">
            <div className="col-6">
              <div className="card stat-card bg-success-subtle">
                <div className="card-body py-3 text-center">
                  <div className="fs-4 fw-bold text-success">{formatCalories(data.caloriesConsumed)}</div>
                  <small className="text-body-secondary">Consumed</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className={`card stat-card ${data.remaining >= 0 ? 'bg-info-subtle' : 'bg-danger-subtle'}`}>
                <div className="card-body py-3 text-center">
                  <div className={`fs-4 fw-bold ${data.remaining >= 0 ? 'text-info' : 'text-danger'}`}>
                    {data.remaining >= 0 ? formatCalories(data.remaining) : `+${formatCalories(data.surplus)}`}
                  </div>
                  <small className="text-body-secondary">{data.remaining >= 0 ? 'Remaining' : 'Over target'}</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <Link to="/steps" className="card stat-card text-decoration-none">
                <div className="card-body py-3 text-center">
                  <div className="fs-4 fw-bold"><i className="bi bi-person-walking text-primary me-1"></i>{data.stepsToday.toLocaleString()}</div>
                  <small className="text-body-secondary">{data.stepTarget.toLocaleString()} goal</small>
                </div>
              </Link>
            </div>
            <div className="col-6">
              <Link to="/heart-rate" className="card stat-card text-decoration-none">
                <div className="card-body py-3 text-center">
                  <div className="fs-4 fw-bold">
                    {data.heartRate?.latestBpm ? (
                      <><i className={`bi bi-heart-pulse ${data.heartRate.isLive ? 'hr-pulse' : 'text-danger'} me-1`}></i>{data.heartRate.latestBpm}</>
                    ) : '—'}
                  </div>
                  <small className="text-body-secondary">{data.heartRate?.isLive ? 'Live BPM' : 'Last BPM'}</small>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick info row */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <Link to="/weight" className="card stat-card text-decoration-none">
            <div className="card-body py-2 text-center">
              <i className="bi bi-speedometer text-warning"></i>
              <div className="fw-bold">{data.latestWeight ? `${data.latestWeight} kg` : '—'}</div>
              <small className="text-body-secondary">Weight</small>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/fasting" className="card stat-card text-decoration-none">
            <div className="card-body py-2 text-center">
              <i className="bi bi-hourglass-split" style={{ color: '#6f42c1' }}></i>
              <div className="fw-bold">
                {data.fasting ? `${data.fasting.progressPercent}%` : 'Not active'}
              </div>
              <small className="text-body-secondary">Fasting</small>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/water" className="card stat-card text-decoration-none">
            <div className="card-body py-2 text-center">
              <i className="bi bi-droplet" style={{ color: '#0dcaf0' }}></i>
              <div className="fw-bold">{data.waterGlasses || 0} glasses</div>
              <small className="text-body-secondary">{data.waterTodayMl || 0}ml today</small>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/sleep" className="card stat-card text-decoration-none">
            <div className="card-body py-2 text-center">
              <i className="bi bi-moon-stars" style={{ color: '#6f42c1' }}></i>
              <div className="fw-bold">{data.sleep ? `${data.sleep.durationHours}h` : '—'}</div>
              <small className="text-body-secondary">{data.sleep ? `Quality: ${data.sleep.quality}/5` : 'Last sleep'}</small>
            </div>
          </Link>
        </div>
      </div>

      {/* Secondary info row */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div className="card stat-card">
            <div className="card-body py-2 text-center">
              <i className="bi bi-cup-straw text-info"></i>
              <div className="fw-bold">{formatCalories(data.drinkCalories)}</div>
              <small className="text-body-secondary">Drink kcal</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card stat-card">
            <div className="card-body py-2 text-center">
              <i className="bi bi-bullseye text-success"></i>
              <div className="fw-bold">{formatCalories(data.dailyTarget)}</div>
              <small className="text-body-secondary">Target</small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent foods */}
      <div className="card stat-card">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold"><i className="bi bi-clock-history me-2"></i>Recent Foods Today</h6>
          <Link to="/daily-log" className="btn btn-sm btn-outline-success">View All</Link>
        </div>
        <div className="card-body p-0">
          {data.recentFoods.length === 0 ? (
            <div className="empty-state py-4">
              <i className="bi bi-egg-fried"></i>
              <p className="mb-2">No food logged today</p>
              <Link to="/foods" className="btn btn-success d-inline-flex align-items-center" style={{ gap: '0.5rem' }}>
                <i className="bi bi-plus-lg"></i>
                <span>Add your first meal</span>
              </Link>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {data.recentFoods.map(f => (
                <div key={f.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{f.name}</div>
                    <small className="text-body-secondary">
                      {f.quantity} {f.unit} · {f.mealType} · {formatTime(f.time)}
                    </small>
                  </div>
                  <span className="badge bg-success rounded-pill">{formatCalories(f.calories)} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
