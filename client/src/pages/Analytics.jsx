import { useState, useEffect } from 'react';
import { getAnalyticsOverview, getAnalyticsTrends, getMealTiming, getFastingInsights, getHeartRateAnalytics } from '../services/api';
import SimpleChart from '../components/charts/SimpleChart';
import { formatHour } from '../utils/format';

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function Analytics() {
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState('calories');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { days };
    Promise.all([
      getAnalyticsOverview(params).catch(() => ({ data: {} })),
      getAnalyticsTrends(params).catch(() => ({ data: {} })),
      getMealTiming(params).catch(() => ({ data: {} })),
      getFastingInsights(params).catch(() => ({ data: {} })),
      getHeartRateAnalytics(params).catch(() => ({ data: {} })),
    ]).then(([overview, trends, timing, fasting, hr]) => {
      setData({
        overview: overview.data,
        trends: trends.data,
        timing: timing.data,
        fasting: fasting.data,
        heartRate: hr.data,
      });
    }).finally(() => setLoading(false));
  }, [days]);

  const tabs = [
    { key: 'calories', label: 'Calories', icon: 'bi-fire' },
    { key: 'weight', label: 'Weight', icon: 'bi-speedometer' },
    { key: 'steps', label: 'Steps', icon: 'bi-person-walking' },
    { key: 'fasting', label: 'Fasting', icon: 'bi-hourglass-split' },
    { key: 'meals', label: 'Meal Timing', icon: 'bi-clock' },
    { key: 'heartrate', label: 'Heart Rate', icon: 'bi-heart-pulse' },
  ];

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-graph-up me-2"></i>Analytics</h5>

      {/* Range filter */}
      <div className="d-flex gap-2 mb-3">
        {RANGES.map(r => (
          <button
            key={r.value}
            className={`btn btn-sm ${days === r.value ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setDays(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Tab nav */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => setTab(t.key)}
          >
            <i className={`bi ${t.icon} me-1`}></i>{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <div>
          {/* CALORIES TAB */}
          {tab === 'calories' && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div className="card stat-card bg-success-subtle">
                    <div className="card-body text-center py-2">
                      <div className="fs-4 fw-bold text-success">{data.overview?.avgCalories || 0}</div>
                      <small>Avg Daily kcal</small>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card stat-card bg-info-subtle">
                    <div className="card-body text-center py-2">
                      <div className="fs-4 fw-bold text-info">{data.overview?.target || 0}</div>
                      <small>Daily Target</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card stat-card mb-3">
                <div className="card-header bg-transparent fw-bold">Calories: Actual vs Target</div>
                <div className="card-body">
                  <SimpleChart
                    data={(data.overview?.chartData || []).map(d => ({ x: d.date, y: d.calories }))}
                    color="#198754" label="Calories" type="bar"
                  />
                </div>
              </div>
              <div className="card stat-card">
                <div className="card-header bg-transparent fw-bold">Surplus / Deficit</div>
                <div className="card-body">
                  <SimpleChart
                    data={(data.trends?.surplusDeficitData || []).map(d => ({ x: d.date, y: d.difference }))}
                    color="#fd7e14" label="Difference" type="bar"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WEIGHT TAB */}
          {tab === 'weight' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">Weight Trend</div>
              <div className="card-body">
                {(data.trends?.weightData || []).length < 2 ? (
                  <div className="empty-state py-3"><p>Not enough weight data. Log at least 2 entries.</p></div>
                ) : (
                  <SimpleChart
                    data={(data.trends?.weightData || []).map(d => ({ x: d.date, y: d.weight }))}
                    color="#fd7e14" label="Weight (kg)" type="line"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEPS TAB */}
          {tab === 'steps' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">Steps Over Time</div>
              <div className="card-body">
                {(data.trends?.stepsData || []).length === 0 ? (
                  <div className="empty-state py-3"><p>No step data for this period.</p></div>
                ) : (
                  <SimpleChart
                    data={(data.trends?.stepsData || []).map(d => ({ x: d.date, y: d.steps }))}
                    color="#0d6efd" label="Steps" type="bar"
                  />
                )}
              </div>
            </div>
          )}

          {/* FASTING TAB */}
          {tab === 'fasting' && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fs-4 fw-bold text-success">{data.fasting?.completionRate || 0}%</div>
                      <small>Completion</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fs-4 fw-bold">{data.fasting?.avgDurationHours || 0}h</div>
                      <small>Avg Duration</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fs-5 fw-bold text-primary">{data.fasting?.bestDay || '—'}</div>
                      <small>Best Day</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card stat-card">
                <div className="card-header bg-transparent fw-bold">Fasting Duration</div>
                <div className="card-body">
                  {(data.fasting?.chartData || []).filter(d => d.durationHours).length === 0 ? (
                    <div className="empty-state py-3"><p>No completed fasts in this period.</p></div>
                  ) : (
                    <SimpleChart
                      data={(data.fasting?.chartData || []).filter(d => d.durationHours).map(d => ({ x: d.date, y: d.durationHours }))}
                      color="#6f42c1" label="Hours" type="bar"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MEAL TIMING TAB */}
          {tab === 'meals' && (
            <div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fw-bold">{data.timing?.avgFirstMealHour ? formatHour(data.timing.avgFirstMealHour) : '—'}</div>
                      <small>Avg First Meal</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fw-bold">{data.timing?.avgLastMealHour ? formatHour(data.timing.avgLastMealHour) : '—'}</div>
                      <small>Avg Last Meal</small>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card stat-card text-center">
                    <div className="card-body py-2">
                      <div className="fw-bold text-warning">{data.timing?.lateNightDays || 0}</div>
                      <small>Late Nights</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card stat-card">
                <div className="card-header bg-transparent fw-bold">Eating Window</div>
                <div className="card-body">
                  {(data.timing?.mealTimingData || []).length === 0 ? (
                    <div className="empty-state py-3"><p>No meal timing data.</p></div>
                  ) : (
                    <SimpleChart
                      data={(data.timing?.mealTimingData || []).map(d => ({ x: d.date, y: d.eatingWindowHours }))}
                      color="#20c997" label="Window (h)" type="bar"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HEART RATE TAB */}
          {tab === 'heartrate' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">Heart Rate Over Time</div>
              <div className="card-body">
                {(data.heartRate?.chartData || []).length === 0 ? (
                  <div className="empty-state py-3"><p>No heart rate data for this period.</p></div>
                ) : (
                  <SimpleChart
                    data={(data.heartRate?.chartData || []).map(d => ({ x: d.date, y: d.avgBpm }))}
                    color="#dc3545" label="Avg BPM" type="line"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
