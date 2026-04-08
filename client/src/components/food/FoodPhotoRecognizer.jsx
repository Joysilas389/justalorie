import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { loadApiKey } from '../../utils/crypto';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export default function FoodPhotoRecognizer({ onResult, onClose }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const fileRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadApiKey().then(key => setApiKey(key));
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image too large. Max 10MB.', 'warning');
      return;
    }

    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImage({ base64, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    if (!image) return;
    if (!apiKey) {
      addToast('Set your Anthropic API key in Settings first', 'danger');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: image.mediaType,
                  data: image.base64,
                },
              },
              {
                type: 'text',
                text: `You are a Ghanaian food expert. Analyze this food image carefully and identify each food item with calorie estimates.

IMPORTANT GHANAIAN FOOD DISTINCTIONS:
- Waakye: Rice and beans cooked together, has a distinctive dark reddish-brown/purple color from dried millet stalk leaves (sorghum leaves). Often served on banana/plantain leaves with spaghetti, shito, eggs, meat, gari, salad.
- Jollof rice: Bright orange-red tomato-based rice. Never has the dark brown/purple tint of waakye.
- Plain rice with stew: White rice served separately with a tomato-based stew on top.
- Banku: White/cream fermented corn and cassava dough ball, smooth texture.
- Kenkey: Similar to banku but wrapped in corn husk or banana leaf, firmer texture.
- Fufu: White pounded cassava/plantain, very smooth and stretchy.
- TZ (Tuo Zaafi): Northern Ghana dish, similar look to banku but made from millet/corn flour.

Look carefully at colors, textures, and accompaniments before identifying.

Respond ONLY with a JSON object (no markdown, no backticks), with this structure:
{
  "foods": [
    {
      "name": "food name",
      "localName": "local/Ghanaian name if applicable or null",
      "estimatedCalories": number,
      "estimatedGrams": number,
      "confidence": "high" or "medium" or "low",
      "notes": "brief note about the estimate"
    }
  ],
  "totalCalories": number,
  "mealDescription": "brief description of the meal"
}`,
              },
            ],
          }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      // Parse JSON response
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);

    } catch (err) {
      console.error('Food recognition error:', err);
      addToast(err.message || 'Failed to analyze food', 'danger');
    }

    setAnalyzing(false);
  };

  const handleUseResult = () => {
    if (result && onResult) {
      onResult(result);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title fw-bold">
              <i className="bi bi-camera me-2"></i>Food Photo Recognition
            </h6>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {!apiKey && (
              <div className="alert alert-warning py-2 mb-3">
                <small><i className="bi bi-key me-1"></i>Set your Anthropic API key in <strong>Settings</strong> to use this feature.</small>
              </div>
            )}

            {/* Camera/File input */}
            <div className="text-center mb-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="d-none"
                onChange={handleFileSelect}
              />
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-success"
                  onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click(); }}
                >
                  <i className="bi bi-camera me-1"></i>Take Photo
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }}
                >
                  <i className="bi bi-image me-1"></i>Gallery
                </button>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="text-center mb-3">
                <img src={preview} alt="Food" className="rounded" style={{ maxWidth: '100%', maxHeight: 250, objectFit: 'cover' }} />
              </div>
            )}

            {/* Analyze button */}
            {image && !result && (
              <button className="btn btn-success w-100 mb-3" onClick={analyzeFood} disabled={analyzing || !apiKey}>
                {analyzing ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing food...</>
                ) : (
                  <><i className="bi bi-magic me-1"></i>Identify Food & Calories</>
                )}
              </button>
            )}

            {/* Results */}
            {result && (
              <div>
                <div className="alert alert-success py-2 mb-3">
                  <strong>{result.mealDescription}</strong>
                  <div className="fs-5 fw-bold mt-1">Total: ~{result.totalCalories} kcal</div>
                </div>

                <div className="list-group mb-3">
                  {result.foods?.map((food, i) => (
                    <div key={i} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold">{food.name}</div>
                          {food.localName && <small className="text-body-secondary">{food.localName}</small>}
                          <small className="d-block text-body-secondary">
                            ~{food.estimatedGrams}g · {food.notes}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-success">{food.estimatedCalories} kcal</span>
                          <br />
                          <span className={`badge mt-1 bg-${food.confidence === 'high' ? 'success' : food.confidence === 'medium' ? 'warning' : 'danger'}`}>
                            {food.confidence}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-success flex-fill" onClick={handleUseResult}>
                    <i className="bi bi-check-lg me-1"></i>Log This Meal
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => { setResult(null); setImage(null); setPreview(null); }}>
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
