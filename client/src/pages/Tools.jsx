import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPortionReduction, getPortionAddition, getSubstitutions, getFoods } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatCalories } from '../utils/format';

export default function Tools() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [calValue, setCalValue] = useState('');
  const [subFoodId, setSubFoodId] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodOptions, setFoodOptions] = useState([]);
  const { addToast } = useToast();

  const tools = [
    { key: 'calculator', label: 'Calorie Calculator', icon: 'bi-calculator', desc: 'Calculate your daily calorie needs', link: '/tools/calculator' },
    { key: 'reduction', label: 'Portion Reduction', icon: 'bi-arrow-down-circle', desc: 'Find foods to reduce to cut calories' },
    { key: 'addition', label: 'Portion Addition', icon: 'bi-arrow-up-circle', desc: 'Find foods to add for weight gain' },
    { key: 'substitution', label: 'Food Substitution', icon: 'bi-arrow-left-right', desc: 'Find lower-calorie alternatives' },
    { key: 'bmi', label: 'BMI Calculator', icon: 'bi-speedometer', desc: 'Check your Body Mass Index', link: '/tools/calculator' },
    { key: 'report', label: 'Wellness Report', icon: 'bi-file-earmark-pdf', desc: 'Export PDF wellness summary', link: '/tools/report' },
  ];

  const handleReduction = async () => {
    if (!calValue) return;
    setLoading(true);
    try {
      const res = await getPortionReduction({ caloriesToCut: parseFloat(calValue) });
      setResults({ type: 'reduction', data: res.data });
    } catch (err) { addToast(err.message, 'danger'); }
    setLoading(false);
  };

  const handleAddition = async () => {
    if (!calValue) return;
    setLoading(true);
    try {
      const res = await getPortionAddition({ caloriesToAdd: parseFloat(calValue) });
      setResults({ type: 'addition', data: res.data });
    } catch (err) { addToast(err.message, 'danger'); }
    setLoading(false);
  };

  const searchFoods = async (q) => {
    setFoodSearch(q);
    if (q.length < 2) { setFoodOptions([]); return; }
    try {
      const res = await getFoods({ search: q, limit: 10 });
      setFoodOptions(res.data.foods);
    } catch { }
  };

  const handleSubstitution = async (foodId) => {
    setLoading(true);
    try {
      const res = await getSubstitutions({ foodId });
      setResults({ type: 'substitution', data: res.data });
    } catch (err) { addToast(err.message, 'danger'); }
    setLoading(false);
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-tools me-2"></i>Tools</h5>

      {tab === 'overview' && (
        <div className="row g-3">
          {tools.map(t => (
            <div key={t.key} className="col-12 col-sm-6 col-lg-4">
              {t.link ? (
                <Link to={t.link} className="card stat-card text-decoration-none h-100">
                  <div className="card-body text-center py-4">
                    <i className={`bi ${t.icon} fs-2 text-success`}></i>
                    <h6 className="fw-bold mt-2 mb-1">{t.label}</h6>
                    <small className="text-body-secondary">{t.desc}</small>
                  </div>
                </Link>
              ) : (
                <div className="card stat-card h-100 cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => { setTab(t.key); setResults(null); }}>
                  <div className="card-body text-center py-4">
                    <i className={`bi ${t.icon} fs-2 text-success`}></i>
                    <h6 className="fw-bold mt-2 mb-1">{t.label}</h6>
                    <small className="text-body-secondary">{t.desc}</small>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REDUCTION TOOL */}
      {tab === 'reduction' && (
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setTab('overview')}>
            <i className="bi bi-arrow-left me-1"></i>Back to Tools
          </button>
          <div className="card stat-card mb-3">
            <div className="card-body">
              <h6 className="fw-bold">How many calories do you want to cut?</h6>
              <div className="input-group mb-2">
                <input type="number" className="form-control" placeholder="e.g. 300" value={calValue} onChange={e => setCalValue(e.target.value)} />
                <span className="input-group-text">kcal</span>
                <button className="btn btn-success" onClick={handleReduction} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Find'}
                </button>
              </div>
            </div>
          </div>
          {results?.type === 'reduction' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">
                Suggestions to cut {results.data.caloriesToCut} kcal
              </div>
              <div className="list-group list-group-flush">
                {results.data.suggestions.map((s, i) => (
                  <div key={i} className="list-group-item">
                    <div className="fw-semibold">{s.food.name}</div>
                    <small className="text-body-secondary">{s.suggestion}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADDITION TOOL */}
      {tab === 'addition' && (
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setTab('overview')}>
            <i className="bi bi-arrow-left me-1"></i>Back to Tools
          </button>
          <div className="card stat-card mb-3">
            <div className="card-body">
              <h6 className="fw-bold">How many calories do you want to add?</h6>
              <div className="input-group mb-2">
                <input type="number" className="form-control" placeholder="e.g. 500" value={calValue} onChange={e => setCalValue(e.target.value)} />
                <span className="input-group-text">kcal</span>
                <button className="btn btn-success" onClick={handleAddition} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Find'}
                </button>
              </div>
            </div>
          </div>
          {results?.type === 'addition' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">
                Suggestions to add {results.data.caloriesToAdd} kcal
              </div>
              <div className="list-group list-group-flush">
                {results.data.suggestions.map((s, i) => (
                  <div key={i} className="list-group-item">
                    <div className="fw-semibold">{s.food.name}</div>
                    <small className="text-body-secondary">{s.suggestion}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBSTITUTION TOOL */}
      {tab === 'substitution' && (
        <div>
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setTab('overview')}>
            <i className="bi bi-arrow-left me-1"></i>Back to Tools
          </button>
          <div className="card stat-card mb-3">
            <div className="card-body">
              <h6 className="fw-bold">Search for a food to find lower-calorie substitutes</h6>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Search food... (e.g. fried yam)"
                value={foodSearch}
                onChange={e => searchFoods(e.target.value)}
              />
              {foodOptions.length > 0 && (
                <div className="list-group">
                  {foodOptions.map(f => (
                    <button
                      key={f.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between"
                      onClick={() => { handleSubstitution(f.id); setFoodOptions([]); setFoodSearch(f.name); }}
                    >
                      <span>{f.name}</span>
                      <span className="badge bg-success">{f.caloriesPer100g} kcal/100g</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {results?.type === 'substitution' && (
            <div className="card stat-card">
              <div className="card-header bg-transparent fw-bold">
                Substitutes for {results.data.original.name} ({results.data.original.caloriesPer100g} kcal/100g)
              </div>
              <div className="list-group list-group-flush">
                {results.data.suggestions.length === 0 ? (
                  <div className="list-group-item text-body-secondary">No lower-calorie alternatives found.</div>
                ) : (
                  results.data.suggestions.map((s, i) => (
                    <div key={i} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">{s.food.name}</span>
                        <span className="badge bg-success">Save {s.calorieSaved} kcal/100g</span>
                      </div>
                      <small className="text-body-secondary">{s.food.caloriesPer100g} kcal/100g · {s.food.category}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
