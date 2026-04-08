import { useState, useRef, useEffect, useCallback } from 'react';

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (err) {
      setError('Camera access denied. You can enter the barcode manually below.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    // Try BarcodeDetector API first (Chrome 83+, Android)
    if ('BarcodeDetector' in window) {
      startCamera();
    } else {
      setError('Barcode scanning is not supported on this browser. Enter the code manually.');
    }
    return () => stopCamera();
  }, []);

  // Use BarcodeDetector API for scanning
  useEffect(() => {
    if (!scanning || !('BarcodeDetector' in window)) return;

    const detector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
    });

    const scanInterval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            clearInterval(scanInterval);
            stopCamera();
            onDetected(code);
          }
        } catch {}
      }
    }, 500);

    return () => clearInterval(scanInterval);
  }, [scanning, onDetected, stopCamera]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      stopCamera();
      onDetected(manualCode.trim());
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h6 className="modal-title fw-bold">
              <i className="bi bi-upc-scan me-2"></i>Scan Barcode
            </h6>
            <button className="btn-close btn-close-white" onClick={() => { stopCamera(); onClose(); }}></button>
          </div>
          <div className="modal-body p-0">
            {/* Camera view */}
            <div className="position-relative" style={{ minHeight: 300, background: '#000' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: 300, objectFit: 'cover' }}
                playsInline
                muted
              />
              {scanning && (
                <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '70%', height: 3, background: '#198754', boxShadow: '0 0 10px #198754', animation: 'scan-line 2s linear infinite' }}></div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="p-3">
              {error && (
                <div className="alert alert-warning py-2 mb-3">
                  <small><i className="bi bi-exclamation-triangle me-1"></i>{error}</small>
                </div>
              )}

              {scanning && (
                <div className="text-center mb-3">
                  <div className="spinner-border spinner-border-sm text-success me-2"></div>
                  <small>Point camera at barcode...</small>
                </div>
              )}

              {/* Manual entry fallback */}
              <div className="mb-2">
                <label className="form-label small text-light">Or enter barcode manually:</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5449000000996"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <button className="btn btn-success" onClick={handleManualSubmit}>
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translate(-50%, -50%) translateY(-60px); }
          50% { transform: translate(-50%, -50%) translateY(60px); }
        }
      `}</style>
    </div>
  );
}
