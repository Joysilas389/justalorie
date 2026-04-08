import { useState } from 'react';
import { calculateTDEE } from '../services/api';
import { ACTIVITY_LEVELS, GOALS } from '../constants';
import { useToast } from '../context/ToastContext';

export default function CalorieCalculator() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    sex: 'male', age: '', weightKg: '', heightCm: '',
    activityLevel: 'MODERATELY_ACTIVE', goal: 'MAINTAIN', targetWeeklyChangeKg: 0.5,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await calculateTDEE({
        ...form,
        age: parseInt(form.age),
        weightKg: parseFloat(form.weightKg),
        heightCm: parseFloat(form.heightCm),
        targetWeeklyChangeKg: parseFloat(form.targetWeeklyChangeKg),
      });
      setResult(res.data);
    } catch (err) {
      addToast(err.message || 'Calculation failed', 'danger');
    }
    setLoading(false);
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-calculator me-2"></i>Calorie Calculator</h5>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card stat-card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Sex</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="sex" value="male" checked={form.sex === 'male'} onChange={handleChange} />
                      <label className="form-check-label">Male</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="sex" value="female" checked={form.sex === 'female'} onChange={handleChange} />
                      <label className="form-check-label">Female</label>
                    </div>
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <label className="form-label">Age</label>
                    <input name="age" type="number" className="form-control" min="10" max="120" value={form.age} onChange={handleChange} required />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Weight (kg)</label>
                    <input name="weightKg" type="number" step="0.1" className="form-control" min="20" value={form.weightKg} onChange={handleChange} required />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Height (cm)</label>
                    <input name="heightCm" type="number" step="0.1" className="form-control" min="50" value={form.heightCm} onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Activity Level</label>
                  <select name="activityLevel" className="form-select" value={form.activityLevel} onChange={handleChange}>
                    {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Goal</label>
                  <div className="d-flex gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g.value} type="button"
                        className={`btn btn-sm flex-fill ${form.goal === g.value ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setForm({ ...form, goal: g.value })}
                      >
                        <i className={`bi ${g.icon} me-1`}></i>{g.label}
                      </button>
                    ))}
                  </div>
                </div>
                {form.goal !== 'MAINTAIN' && (
                  <div className="mb-3">
                    <label className="form-label">Weekly change target (kg)</label>
                    <input name="targetWeeklyChangeKg" type="number" step="0.1" min="0.1" max="2" className="form-control" value={form.targetWeeklyChangeKg} onChange={handleChange} />
                  </div>
                )}
                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-lightning me-1"></i>}
                  Calculate
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          {result && (
            <div className="card stat-card border-success">
              <div className="card-body">
                <h6 className="fw-bold text-success mb-3">Your Results</h6>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-body-secondary rounded text-center">
                      <div className="fs-4 fw-bold">{result.bmr}</div>
                      <small className="text-body-secondary">BMR (kcal)</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-body-secondary rounded text-center">
                      <div className="fs-4 fw-bold">{result.tdee}</div>
                      <small className="text-body-secondary">TDEE (kcal)</small>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-success-subtle rounded text-center mb-3">
                  <div className="fs-2 fw-bold text-success">{result.dailyTarget}</div>
                  <small>Daily Calorie Target (kcal)</small>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="p-2 bg-info-subtle rounded text-center">
                      <div className="fw-bold">{result.bmi}</div>
                      <small>BMI</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-info-subtle rounded text-center">
                      <div className="fw-bold">{result.bmiCategory}</div>
                      <small>Category</small>
                    </div>
                  </div>
                </div>

                <div className="alert alert-success py-2 mb-0">
                  <small>{result.explanation}</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
