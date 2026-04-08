import { useState } from 'react';
import { getWellnessReport } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function WellnessReport() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getWellnessReport({ days });
      setData(res.data);
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setLoading(false);
  };

  const generatePDF = () => {
    if (!data) return;

    const d = data;
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Justalorie Wellness Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; padding: 30px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px solid #198754; padding-bottom: 20px; margin-bottom: 25px; }
  .header h1 { color: #198754; font-size: 28px; }
  .header .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
  .header .period { background: #f0fdf4; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-top: 10px; font-size: 13px; }
  .section { margin-bottom: 25px; page-break-inside: avoid; }
  .section h2 { color: #198754; font-size: 18px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .stat-box { background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-box .value { font-size: 24px; font-weight: 700; color: #198754; }
  .stat-box .label { font-size: 11px; color: #666; margin-top: 2px; }
  .stat-box.warning .value { color: #fd7e14; }
  .stat-box.danger .value { color: #dc3545; }
  .stat-box.info .value { color: #0dcaf0; }
  .stat-box.purple .value { color: #6f42c1; }
  .insight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px 14px; border-radius: 4px; margin-top: 10px; font-size: 13px; }
  .insight.good { background: #d1e7dd; border-left-color: #198754; }
  .insight.bad { background: #f8d7da; border-left-color: #dc3545; }
  .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #dee2e6; color: #999; font-size: 11px; }
  @media print { body { padding: 15px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>🍽️ Justalorie Wellness Report</h1>
    <div class="subtitle">Personal Health & Nutrition Summary for <strong>${d.profile.name}</strong></div>
    <div class="period">📅 ${d.period.startDate} to ${d.period.endDate} (${d.period.days} days)</div>
  </div>

  <div class="section">
    <h2>👤 Profile</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.profile.age || '—'}</div><div class="label">Age</div></div>
      <div class="stat-box"><div class="value">${d.profile.sex || '—'}</div><div class="label">Sex</div></div>
      <div class="stat-box"><div class="value">${d.profile.goal || '—'}</div><div class="label">Goal</div></div>
    </div>
    ${d.bmi ? `<div class="grid" style="margin-top:10px">
      <div class="stat-box"><div class="value">${d.bmi.value}</div><div class="label">BMI</div></div>
      <div class="stat-box"><div class="value">${d.bmi.category}</div><div class="label">Category</div></div>
      <div class="stat-box"><div class="value">${d.profile.dailyTarget}</div><div class="label">Calorie Target</div></div>
    </div>` : ''}
  </div>

  <div class="section">
    <h2>🔥 Nutrition</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.nutrition.avgDailyCalories}</div><div class="label">Avg Daily kcal</div></div>
      <div class="stat-box"><div class="value">${d.nutrition.dailyTarget}</div><div class="label">Target kcal</div></div>
      <div class="stat-box"><div class="value">${d.nutrition.adherence}%</div><div class="label">Days Tracked</div></div>
    </div>
    <div class="grid" style="margin-top:10px">
      <div class="stat-box"><div class="value">${d.nutrition.totalMealsLogged}</div><div class="label">Meals Logged</div></div>
      <div class="stat-box"><div class="value">${d.nutrition.daysTracked}</div><div class="label">Active Days</div></div>
      <div class="stat-box ${d.nutrition.avgDailyCalories > d.nutrition.dailyTarget ? 'danger' : 'good'}">
        <div class="value">${d.nutrition.avgDailyCalories - d.nutrition.dailyTarget > 0 ? '+' : ''}${d.nutrition.avgDailyCalories - d.nutrition.dailyTarget}</div>
        <div class="label">Avg Difference</div>
      </div>
    </div>
    ${d.nutrition.avgDailyCalories > d.nutrition.dailyTarget + 300 ? '<div class="insight bad">⚠️ Your average intake exceeds your target by more than 300 kcal. Consider reviewing portion sizes.</div>' : d.nutrition.avgDailyCalories > 0 && d.nutrition.avgDailyCalories <= d.nutrition.dailyTarget ? '<div class="insight good">✅ Great job! Your average intake is within your calorie target.</div>' : ''}
  </div>

  <div class="section">
    <h2>⚖️ Weight</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.weight.startWeight ? d.weight.startWeight + ' kg' : '—'}</div><div class="label">Start Weight</div></div>
      <div class="stat-box"><div class="value">${d.weight.endWeight ? d.weight.endWeight + ' kg' : '—'}</div><div class="label">Current Weight</div></div>
      <div class="stat-box ${d.weight.change > 0 ? 'warning' : 'good'}">
        <div class="value">${d.weight.change !== null ? (d.weight.change > 0 ? '+' : '') + d.weight.change + ' kg' : '—'}</div>
        <div class="label">${d.weight.direction}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🚶 Steps</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.steps.avgDaily.toLocaleString()}</div><div class="label">Avg Daily Steps</div></div>
      <div class="stat-box"><div class="value">${d.steps.target.toLocaleString()}</div><div class="label">Target</div></div>
      <div class="stat-box"><div class="value">${d.steps.daysTracked}</div><div class="label">Days Tracked</div></div>
    </div>
    ${d.steps.avgDaily < 5000 && d.steps.avgDaily > 0 ? '<div class="insight bad">⚠️ Your average steps are below 5,000. Try to increase daily movement.</div>' : d.steps.avgDaily >= 10000 ? '<div class="insight good">✅ Excellent! You\'re averaging over 10,000 steps daily.</div>' : ''}
  </div>

  <div class="section">
    <h2>💧 Hydration</h2>
    <div class="grid">
      <div class="stat-box info"><div class="value">${d.water.avgDailyMl}</div><div class="label">Avg Daily (ml)</div></div>
      <div class="stat-box info"><div class="value">${d.water.avgDailyGlasses}</div><div class="label">Avg Glasses</div></div>
      <div class="stat-box"><div class="value">${d.water.daysTracked}</div><div class="label">Days Tracked</div></div>
    </div>
    ${d.water.avgDailyMl > 0 && d.water.avgDailyMl < 1500 ? '<div class="insight bad">⚠️ You may be under-hydrated. Aim for at least 2,000ml (8 glasses) daily.</div>' : d.water.avgDailyMl >= 2000 ? '<div class="insight good">✅ Good hydration! You\'re averaging over 2 litres daily.</div>' : ''}
  </div>

  <div class="section">
    <h2>😴 Sleep</h2>
    <div class="grid">
      <div class="stat-box purple"><div class="value">${d.sleep.avgDurationHours}h</div><div class="label">Avg Duration</div></div>
      <div class="stat-box"><div class="value">${d.sleep.avgQuality}/5</div><div class="label">Avg Quality</div></div>
      <div class="stat-box"><div class="value">${d.sleep.entries}</div><div class="label">Nights Logged</div></div>
    </div>
    ${d.sleep.avgDurationHours > 0 && d.sleep.avgDurationHours < 6 ? '<div class="insight bad">⚠️ You\'re averaging less than 6 hours of sleep. This can increase hunger and reduce energy.</div>' : d.sleep.avgDurationHours >= 7 ? '<div class="insight good">✅ Healthy sleep duration! 7+ hours supports weight management.</div>' : ''}
  </div>

  <div class="section">
    <h2>⏱️ Fasting</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.fasting.totalSessions}</div><div class="label">Total Fasts</div></div>
      <div class="stat-box"><div class="value">${d.fasting.completed}</div><div class="label">Completed</div></div>
      <div class="stat-box ${d.fasting.completionRate >= 70 ? 'good' : 'warning'}"><div class="value">${d.fasting.completionRate}%</div><div class="label">Completion Rate</div></div>
    </div>
  </div>

  <div class="section">
    <h2>❤️ Heart Rate</h2>
    <div class="grid">
      <div class="stat-box"><div class="value">${d.heartRate.avgBpm || '—'}</div><div class="label">Avg BPM</div></div>
      <div class="stat-box"><div class="value">${d.heartRate.readings}</div><div class="label">Total Readings</div></div>
      <div class="stat-box"><div class="value">${d.heartRate.avgBpm && d.heartRate.avgBpm < 100 ? 'Normal' : d.heartRate.avgBpm ? 'Elevated' : '—'}</div><div class="label">Status</div></div>
    </div>
  </div>

  <div class="footer">
    Generated by Justalorie · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · justalorie.vercel.app
  </div>
</body>
</html>`;

    // Open in new window for print/save as PDF
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-file-earmark-pdf me-2"></i>Wellness Report</h5>

      <div className="card stat-card mb-3">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Generate your wellness summary PDF</h6>
          <div className="d-flex gap-2 mb-3">
            {[7, 14, 30, 60, 90].map(d => (
              <button
                key={d}
                className={`btn btn-sm ${days === d ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setDays(d)}
              >
                {d} days
              </button>
            ))}
          </div>
          <button className="btn btn-success w-100 mb-2" onClick={loadReport} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Generating...</> : <><i className="bi bi-lightning me-1"></i>Generate Report</>}
          </button>
        </div>
      </div>

      {/* Preview */}
      {data && (
        <div>
          <div className="card stat-card mb-3">
            <div className="card-header bg-transparent fw-bold d-flex justify-content-between">
              <span>Report Preview ({data.period.days} days)</span>
              <button className="btn btn-sm btn-success" onClick={generatePDF}>
                <i className="bi bi-download me-1"></i>Download PDF
              </button>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <div className="p-2 bg-success-subtle rounded text-center">
                    <div className="fs-5 fw-bold text-success">{data.nutrition.avgDailyCalories}</div>
                    <small>Avg kcal/day</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 bg-warning-subtle rounded text-center">
                    <div className="fs-5 fw-bold text-warning">{data.weight.endWeight ? `${data.weight.endWeight} kg` : '—'}</div>
                    <small>Current Weight</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-primary-subtle rounded text-center">
                    <div className="fw-bold text-primary">{data.steps.avgDaily.toLocaleString()}</div>
                    <small>Avg Steps</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-info-subtle rounded text-center">
                    <div className="fw-bold" style={{ color: '#0dcaf0' }}>{data.water.avgDailyGlasses}</div>
                    <small>Avg Glasses</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(111,66,193,0.1)' }}>
                    <div className="fw-bold" style={{ color: '#6f42c1' }}>{data.sleep.avgDurationHours}h</div>
                    <small>Avg Sleep</small>
                  </div>
                </div>
              </div>

              <div className="mt-3 d-grid">
                <button className="btn btn-success" onClick={generatePDF}>
                  <i className="bi bi-file-earmark-pdf me-1"></i>Save / Print as PDF
                </button>
              </div>
              <small className="text-body-secondary d-block text-center mt-2">
                Tap "Save / Print as PDF" then choose "Save as PDF" in the print dialog
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
