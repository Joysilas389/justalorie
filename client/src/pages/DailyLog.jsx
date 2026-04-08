import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFoodLogs, deleteFoodLog } from '../services/api';
import { MEAL_TYPES } from '../constants';
import { formatCalories, formatTime, formatDateKey, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';
import dayjs from 'dayjs';

export default function DailyLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(formatDateKey());
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getFoodLogs({ date });
      setLogs(res.data.logs);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, [date]);

  const totalCalories = logs.reduce((sum, l) => sum + l.caloriesTotal, 0);
  const mealGroups = {};
  MEAL_TYPES.forEach(m => { mealGroups[m.value] = logs.filter(l => l.mealType === m.value); });

  const handleDelete = async () => {
    try {
      await deleteFoodLog(deleteId);
      addToast('Log deleted', 'success');
      setDeleteId(null);
      loadLogs();
    } catch {
      addToast('Failed to delete', 'danger');
    }
  };

  const goDay = (offset) => {
    setDate(formatDateKey(dayjs(date).add(offset, 'day').toDate()));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold"><i className="bi bi-journal-text me-2"></i>Daily Log</h5>
        <Link to="/foods" className="btn btn-success btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Add Food
        </Link>
      </div>

      {/* Date navigation */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => goDay(-1)}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <input type="date" className="form-control form-control-sm" style={{ maxWidth: 160 }} value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn btn-sm btn-outline-secondary" onClick={() => goDay(1)}>
          <i className="bi bi-chevron-right"></i>
        </button>
        <button className="btn btn-sm btn-outline-success" onClick={() => setDate(formatDateKey())}>Today</button>
      </div>

      {/* Summary */}
      <div className="alert alert-success d-flex justify-content-between align-items-center py-2 mb-3">
        <span><i className="bi bi-fire me-1"></i><strong>Total:</strong> {formatCalories(totalCalories)} kcal</span>
        <span className="badge bg-success">{logs.length} items</span>
      </div>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-success"></div></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-journal"></i>
          <p>No food logged for {formatDate(date)}</p>
          <Link to="/foods" className="btn btn-success d-inline-flex align-items-center" style={{ gap: '0.5rem' }}><i className="bi bi-plus-lg"></i><span>Log something</span></Link>
        </div>
      ) : (
        <div className="accordion" id="mealAccordion">
          {MEAL_TYPES.filter(m => mealGroups[m.value]?.length > 0).map((meal, idx) => {
            const items = mealGroups[meal.value];
            const mealCal = items.reduce((s, l) => s + l.caloriesTotal, 0);
            return (
              <div className="accordion-item" key={meal.value}>
                <h2 className="accordion-header">
                  <button className={`accordion-button ${idx > 0 ? 'collapsed' : ''}`} type="button" data-bs-toggle="collapse" data-bs-target={`#meal-${meal.value}`}>
                    <i className={`bi ${meal.icon} me-2`}></i>
                    {meal.label}
                    <span className="badge bg-success ms-auto me-2">{formatCalories(mealCal)} kcal</span>
                  </button>
                </h2>
                <div id={`meal-${meal.value}`} className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`} data-bs-parent="#mealAccordion">
                  <div className="accordion-body p-0">
                    <div className="list-group list-group-flush">
                      {items.map(log => (
                        <div key={log.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold">{log.food?.name}</div>
                              <small className="text-body-secondary">
                                {log.quantity} {log.unit}
                                {log.gramsConsumed ? ` (${Math.round(log.gramsConsumed)}g)` : ''}
                                {' · '}{formatTime(log.loggedAt)}
                              </small>
                              {log.note && <small className="d-block text-body-secondary fst-italic">{log.note}</small>}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success">{formatCalories(log.caloriesTotal)}</span>
                              <button className="btn btn-sm btn-outline-danger py-0 px-1" onClick={() => setDeleteId(log.id)}>
                                <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header"><h6 className="modal-title fw-bold">Delete Log</h6></div>
              <div className="modal-body">Do you want to delete this item?</div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteId(null)}>No</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
