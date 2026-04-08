import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFood, createFood, updateFood, getCategories } from '../services/api';
import { useToast } from '../context/ToastContext';

const PREP_TYPES = ['RAW', 'BOILED', 'FRIED', 'GRILLED', 'ROASTED', 'STEAMED', 'BAKED', 'SMOKED', 'BLENDED', 'MASHED', 'STEWED', 'MIXED', 'OTHER'];
const PKG_TYPES = ['NONE', 'CAN', 'BOTTLE', 'TIN', 'SACHET', 'LOAF'];

export default function AddEditFood() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', localName: '', categoryId: '', caloriesPer100g: '',
    caloriesPerUnit: '', standardServingG: '', servingDescription: '',
    proteinPer100g: '', carbsPer100g: '', fatPer100g: '',
    preparationType: 'OTHER', packageType: 'NONE',
    packageVolumeMl: '', packageWeightG: '',
    slicesPerLoaf: '', caloriesPerSlice: '', sourceNote: '',
  });

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(() => {});
    if (isEdit) {
      getFood(id).then(res => {
        const f = res.data;
        setForm({
          name: f.name || '', localName: f.localName || '', categoryId: f.categoryId || '',
          caloriesPer100g: f.caloriesPer100g || '', caloriesPerUnit: f.caloriesPerUnit || '',
          standardServingG: f.standardServingG || '', servingDescription: f.servingDescription || '',
          proteinPer100g: f.proteinPer100g || '', carbsPer100g: f.carbsPer100g || '',
          fatPer100g: f.fatPer100g || '', preparationType: f.preparationType || 'OTHER',
          packageType: f.packageType || 'NONE', packageVolumeMl: f.packageVolumeMl || '',
          packageWeightG: f.packageWeightG || '', slicesPerLoaf: f.slicesPerLoaf || '',
          caloriesPerSlice: f.caloriesPerSlice || '', sourceNote: f.sourceNote || '',
        });
      }).catch(() => addToast('Food not found', 'danger'));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        categoryId: parseInt(form.categoryId),
        caloriesPer100g: parseFloat(form.caloriesPer100g),
        caloriesPerUnit: form.caloriesPerUnit ? parseFloat(form.caloriesPerUnit) : null,
        standardServingG: form.standardServingG ? parseFloat(form.standardServingG) : null,
        proteinPer100g: form.proteinPer100g ? parseFloat(form.proteinPer100g) : null,
        carbsPer100g: form.carbsPer100g ? parseFloat(form.carbsPer100g) : null,
        fatPer100g: form.fatPer100g ? parseFloat(form.fatPer100g) : null,
        packageVolumeMl: form.packageVolumeMl ? parseFloat(form.packageVolumeMl) : null,
        packageWeightG: form.packageWeightG ? parseFloat(form.packageWeightG) : null,
        slicesPerLoaf: form.slicesPerLoaf ? parseInt(form.slicesPerLoaf) : null,
        caloriesPerSlice: form.caloriesPerSlice ? parseFloat(form.caloriesPerSlice) : null,
      };
      if (isEdit) {
        await updateFood(id, data);
        addToast('Food updated!', 'success');
      } else {
        await createFood(data);
        addToast('Food created!', 'success');
      }
      navigate('/foods');
    } catch (err) {
      addToast(err.message || 'Failed to save', 'danger');
    }
    setSaving(false);
  };

  return (
    <div>
      <nav className="mb-3">
        <Link to="/foods" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Back
        </Link>
      </nav>

      <h5 className="fw-bold mb-3">{isEdit ? 'Edit Food' : 'Add Custom Food'}</h5>

      <form onSubmit={handleSubmit}>
        <div className="card stat-card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Basic Info</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Food Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Local Name</label>
                <input name="localName" className="form-control" value={form.localName} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Category *</label>
                <select name="categoryId" className="form-select" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Preparation Type</label>
                <select name="preparationType" className="form-select" value={form.preparationType} onChange={handleChange}>
                  {PREP_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card stat-card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Nutrition</h6>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <label className="form-label">Calories/100g *</label>
                <input name="caloriesPer100g" type="number" step="0.1" className="form-control" value={form.caloriesPer100g} onChange={handleChange} required />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Calories/Unit</label>
                <input name="caloriesPerUnit" type="number" step="0.1" className="form-control" value={form.caloriesPerUnit} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Protein/100g</label>
                <input name="proteinPer100g" type="number" step="0.1" className="form-control" value={form.proteinPer100g} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Carbs/100g</label>
                <input name="carbsPer100g" type="number" step="0.1" className="form-control" value={form.carbsPer100g} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Fat/100g</label>
                <input name="fatPer100g" type="number" step="0.1" className="form-control" value={form.fatPer100g} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Std Serving (g)</label>
                <input name="standardServingG" type="number" className="form-control" value={form.standardServingG} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Serving Description</label>
                <input name="servingDescription" className="form-control" placeholder="e.g. 1 plate, 1 ball" value={form.servingDescription} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="card stat-card mb-3">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Package / Slice Info</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Package Type</label>
                <select name="packageType" className="form-select" value={form.packageType} onChange={handleChange}>
                  {PKG_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Package Weight (g)</label>
                <input name="packageWeightG" type="number" className="form-control" value={form.packageWeightG} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Package Volume (ml)</label>
                <input name="packageVolumeMl" type="number" className="form-control" value={form.packageVolumeMl} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Slices/Loaf</label>
                <input name="slicesPerLoaf" type="number" className="form-control" value={form.slicesPerLoaf} onChange={handleChange} />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label">Calories/Slice</label>
                <input name="caloriesPerSlice" type="number" step="0.1" className="form-control" value={form.caloriesPerSlice} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Source Note</label>
                <input name="sourceNote" className="form-control" placeholder="e.g. USDA, Label" value={form.sourceNote} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>{isEdit ? 'Update Food' : 'Add Food'}</>}
        </button>
      </form>
    </div>
  );
}
