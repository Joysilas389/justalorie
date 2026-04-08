export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title fw-bold">{title || 'Confirm'}</h6>
            <button className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message || 'Are you sure?'}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>No</button>
            <button className="btn btn-danger btn-sm" onClick={onConfirm}>Yes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
