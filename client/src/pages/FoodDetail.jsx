import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFood, deleteFood } from '../services/api';
import { CONFIDENCE_COLORS } from '../constants';
import { getConfidenceLabel } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { CalorieDensityAlert } from '../components/food/CalorieDensityWarning';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    getFood(id)
      .then(res => setFood(res.data))
      .catch(() => addToast('Food not found', 'danger'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteFood(id);
      addToast('Food deleted', 'success');
      navigate('/foods');
    } catch {
      addToast('Failed to delete', 'danger');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  if (!food) return <div className="empty-state"><i className="bi bi-question-circle"></i><p>Food not found</p></div>;

  return (
    <div>
      <nav className="mb-3">
        <Link to="/foods" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Back
        </Link>
      </nav>

      <div className="card stat-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="fw-bold mb-1">{food.name}</h4>
              {food.localName && <p className="text-body-secondary mb-0">{food.localName}</p>}
            </div>
            <span className={`badge badge-${CONFIDENCE_COLORS[food.confidenceLevel]}`}>
              {getConfidenceLabel(food.confidenceLevel)}
            </span>
          </div>

          <CalorieDensityAlert caloriesPer100g={food.caloriesPer100g} foodName={food.name} />

          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div className="p-2 bg-success-subtle rounded text-center">
                <div className="fs-5 fw-bold text-success">{food.caloriesPer100g}</div>
                <small>kcal / 100g</small>
              </div>
            </div>
            {food.proteinPer100g && (
              <div className="col-6 col-md-3">
                <div className="p-2 bg-primary-subtle rounded text-center">
                  <div className="fs-5 fw-bold text-primary">{food.proteinPer100g}g</div>
                  <small>Protein / 100g</small>
                </div>
              </div>
            )}
            {food.carbsPer100g && (
              <div className="col-6 col-md-3">
                <div className="p-2 bg-warning-subtle rounded text-center">
                  <div className="fs-5 fw-bold text-warning">{food.carbsPer100g}g</div>
                  <small>Carbs / 100g</small>
                </div>
              </div>
            )}
            {food.fatPer100g && (
              <div className="col-6 col-md-3">
                <div className="p-2 bg-danger-subtle rounded text-center">
                  <div className="fs-5 fw-bold text-danger">{food.fatPer100g}g</div>
                  <small>Fat / 100g</small>
                </div>
              </div>
            )}
          </div>

          <table className="table table-sm mb-3">
            <tbody>
              <tr><td className="text-body-secondary">Category</td><td>{food.category?.name}</td></tr>
              <tr><td className="text-body-secondary">Serving</td><td>{food.servingDescription || '—'}</td></tr>
              <tr><td className="text-body-secondary">Standard Serving</td><td>{food.standardServingG ? `${food.standardServingG}g` : '—'}</td></tr>
              <tr><td className="text-body-secondary">Preparation</td><td>{food.preparationType}</td></tr>
              {food.packageType !== 'NONE' && <tr><td className="text-body-secondary">Package</td><td>{food.packageType} {food.packageWeightG ? `(${food.packageWeightG}g)` : ''} {food.packageVolumeMl ? `(${food.packageVolumeMl}ml)` : ''}</td></tr>}
              {food.caloriesPerSlice && <tr><td className="text-body-secondary">Per Slice</td><td>{food.caloriesPerSlice} kcal ({food.slicesPerLoaf} slices/loaf)</td></tr>}
              {food.caloriesPerUnit && <tr><td className="text-body-secondary">Per Unit/Piece</td><td>{food.caloriesPerUnit} kcal</td></tr>}
              <tr><td className="text-body-secondary">Source</td><td>{food.sourceNote || '—'}</td></tr>
            </tbody>
          </table>

          {food.servingOptions?.length > 0 && (
            <>
              <h6 className="fw-bold">Serving Options</h6>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {food.servingOptions.map(so => (
                  <span key={so.id} className={`badge ${so.isDefault ? 'bg-success' : 'bg-secondary'}`}>
                    {so.label} = {so.gramsEquiv}g
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="d-flex gap-2">
            {food.isUserAdded && (
              <>
                <Link to={`/foods/${food.id}/edit`} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-pencil me-1"></i>Edit
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDelete(true)}>
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">Delete Food</h6>
                <button className="btn-close" onClick={() => setShowDelete(false)}></button>
              </div>
              <div className="modal-body">
                <p>Do you want to delete this item?</p>
                <p className="fw-semibold">{food.name}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDelete(false)}>No</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
