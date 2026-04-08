import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFoods, getCategories, createFoodLog } from '../services/api';
import { CONFIDENCE_COLORS, MEAL_TYPES, UNITS } from '../constants';
import { formatCalories, getConfidenceLabel } from '../utils/format';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';
import BarcodeScanner from '../components/food/BarcodeScanner';
import FoodPhotoRecognizer from '../components/food/FoodPhotoRecognizer';
import CalorieDensityBadge from '../components/food/CalorieDensityWarning';

export default function FoodDatabase() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(null);
  const [logForm, setLogForm] = useState({ quantity: 1, unit: 'g', mealType: 'OTHER' });
  const [showScanner, setShowScanner] = useState(false);
  const [showPhotoAI, setShowPhotoAI] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);
  const { addToast } = useToast();

  const loadFoods = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      const res = await getFoods(params);
      setFoods(res.data.foods);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadFoods, 300);
    return () => clearTimeout(timer);
  }, [search, categoryId]);

  const openLogModal = (food) => {
    const defaultServing = food.servingOptions?.find(s => s.isDefault);
    setLogForm({
      quantity: 1,
      unit: defaultServing ? defaultServing.label : (food.packageType !== 'NONE' ? food.packageType.toLowerCase() : 'g'),
      mealType: 'OTHER',
    });
    setLogModal(food);
  };

  const handleLog = async () => {
    try {
      await createFoodLog({
        foodId: logModal.id,
        quantity: parseFloat(logForm.quantity),
        unit: logForm.unit,
        mealType: logForm.mealType,
      });
      addToast(`${logModal.name} logged!`, 'success');
      setLogModal(null);
    } catch (err) {
      addToast(err.message || 'Failed to log food', 'danger');
    }
  };

  const handleBarcodeDetected = (code) => {
    setShowScanner(false);
    // Search for the barcode in food database
    setSearch(code);
    addToast(`Barcode detected: ${code}. Searching...`, 'info');
  };

  const handlePhotoResult = (result) => {
    setShowPhotoAI(false);
    setPhotoResult(result);
    addToast(`Identified ${result.foods?.length || 0} food items (~${result.totalCalories} kcal)`, 'success');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold"><i className="bi bi-search me-2"></i>Food Database</h5>
        <Link to="/foods/add" className="btn btn-success btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Add Food
        </Link>
      </div>

      {/* Quick action buttons: Barcode + Photo AI */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-success btn-sm flex-fill" onClick={() => setShowScanner(true)}>
          <i className="bi bi-upc-scan me-1"></i>Scan Barcode
        </button>
        <button className="btn btn-outline-success btn-sm flex-fill" onClick={() => setShowPhotoAI(true)}>
          <i className="bi bi-camera me-1"></i>Photo AI
        </button>
      </div>

      {/* Photo AI result card */}
      {photoResult && (
        <div className="card stat-card border-success mb-3">
          <div className="card-header bg-success-subtle d-flex justify-content-between align-items-center">
            <span className="fw-bold"><i className="bi bi-camera me-1"></i>Photo Recognition Result</span>
            <button className="btn btn-sm btn-outline-danger py-0" onClick={() => setPhotoResult(null)}>
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="card-body py-2">
            <small className="text-body-secondary">{photoResult.mealDescription}</small>
            <div className="fs-5 fw-bold text-success mb-2">Total: ~{photoResult.totalCalories} kcal</div>
            {photoResult.foods?.map((food, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-1">
                <div>
                  <span className="fw-semibold">{food.name}</span>
                  {food.localName && <small className="text-body-secondary ms-1">({food.localName})</small>}
                  <small className="d-block text-body-secondary">~{food.estimatedGrams}g</small>
                </div>
                <span className="badge bg-success">{food.estimatedCalories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search foods... (e.g. waakye, banku, jollof)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
        <div className="col-12 col-md-4">
          <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c._count?.foods || 0})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-success"></div></div>
      ) : foods.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-egg-fried"></i>
          <p>No foods found. Try a different search or add a custom food.</p>
        </div>
      ) : (
        <div className="row g-2">
          {foods.map(food => (
            <div key={food.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card stat-card h-100">
                <div className="card-body py-2 px-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <Link to={`/foods/${food.id}`} className="fw-semibold text-decoration-none text-body">
                        {food.name}
                      </Link>
                      {food.localName && food.localName !== food.name && (
                        <small className="d-block text-body-secondary">{food.localName}</small>
                      )}
                    </div>
                    <span className={`badge badge-${CONFIDENCE_COLORS[food.confidenceLevel]} ms-2`} style={{ fontSize: '0.65rem' }}>
                      {getConfidenceLabel(food.confidenceLevel)}
                    </span>
                  </div>
                  <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-success">{food.caloriesPer100g} kcal/100g</span>
                    <CalorieDensityBadge caloriesPer100g={food.caloriesPer100g} />
                    {food.category && (
                      <small className="text-body-secondary"><i className={`bi ${food.category.icon} me-1`}></i>{food.category.name}</small>
                    )}
                  </div>
                  {food.servingDescription && (
                    <small className="text-body-secondary d-block mt-1">{food.servingDescription}</small>
                  )}
                  <div className="mt-2">
                    <button className="btn btn-sm btn-outline-success w-100" onClick={() => openLogModal(food)}>
                      <i className="bi bi-plus-circle me-1"></i>Quick Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log modal */}
      {logModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">Log: {logModal.name}</h6>
                <button className="btn-close" onClick={() => setLogModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0.1"
                    step="0.1"
                    value={logForm.quantity}
                    onChange={e => setLogForm({ ...logForm, quantity: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unit / Serving</label>
                  <select className="form-select" value={logForm.unit} onChange={e => setLogForm({ ...logForm, unit: e.target.value })}>
                    {logModal.servingOptions?.map(so => (
                      <option key={so.id} value={so.label}>{so.label} ({so.gramsEquiv}g)</option>
                    ))}
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Meal Type</label>
                  <select className="form-select" value={logForm.mealType} onChange={e => setLogForm({ ...logForm, mealType: e.target.value })}>
                    {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="alert alert-success py-2 mb-0">
                  <small>
                    <strong>Estimate:</strong> {logForm.quantity} × {logForm.unit} of {logModal.name}
                    {' ≈ '}{formatCalories(logModal.caloriesPer100g * (parseFloat(logForm.quantity) || 0) * (logModal.standardServingG || 100) / 100)} kcal
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setLogModal(null)}>Cancel</button>
                <button className="btn btn-success" onClick={handleLog}>
                  <i className="bi bi-check-lg me-1"></i>Log Food
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Photo AI Modal */}
      {showPhotoAI && (
        <FoodPhotoRecognizer
          onResult={handlePhotoResult}
          onClose={() => setShowPhotoAI(false)}
        />
      )}
    </div>
  );
}
