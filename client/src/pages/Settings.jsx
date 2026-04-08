import { useState, useEffect } from 'react';
import { getProfile, updateProfile, cleanupDuplicates } from '../services/api';
import { ACTIVITY_LEVELS, GOALS } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  getReminders, saveReminders, requestNotificationPermission,
  getNotificationPermission, sendNotification
} from '../services/notifications';
import { saveApiKey, loadApiKey } from '../utils/crypto';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [notifPermission, setNotifPermission] = useState('default');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data?.profile))
      .catch(() => {})
      .finally(() => setLoading(false));
    setReminders(getReminders());
    setNotifPermission(getNotificationPermission());
    // Only check if key exists — never load it into state
    loadApiKey().then(key => { setHasApiKey(!!key); });
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        sex: profile.sex,
        age: profile.age ? parseInt(profile.age) : null,
        weightKg: profile.weightKg ? parseFloat(profile.weightKg) : null,
        heightCm: profile.heightCm ? parseFloat(profile.heightCm) : null,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
        targetWeeklyChangeKg: profile.targetWeeklyChangeKg ? parseFloat(profile.targetWeeklyChangeKg) : 0.5,
        dailyStepTarget: profile.dailyStepTarget ? parseInt(profile.dailyStepTarget) : 10000,
      });
      addToast('Profile saved!', 'success');
    } catch (err) {
      addToast(err.message, 'danger');
    }
    setSaving(false);
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      addToast('Notifications enabled!', 'success');
      sendNotification('Justalorie', '🎉 Notifications are now active!');
    } else if (perm === 'denied') {
      addToast('Notifications blocked. Enable in browser settings.', 'warning');
    }
  };

  const toggleReminder = (id) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    saveReminders(updated);
    const r = updated.find(x => x.id === id);
    addToast(`${r.label} ${r.enabled ? 'enabled' : 'disabled'}`, 'success');
  };

  const updateReminderTime = (id, time) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, time } : r
    );
    setReminders(updated);
    saveReminders(updated);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      addToast('Please enter an API key', 'warning');
      return;
    }
    await saveApiKey(apiKey.trim());
    setApiKey('');
    setHasApiKey(true);
    setEditingKey(false);
    addToast('API key encrypted and saved!', 'success');
  };

  const handleRemoveApiKey = async () => {
    await saveApiKey('');
    setApiKey('');
    setHasApiKey(false);
    setEditingKey(false);
    addToast('API key removed', 'success');
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-gear me-2"></i>Settings</h5>

      {/* Theme */}
      <div className="card stat-card mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0">Theme</h6>
            <small className="text-body-secondary">Currently: {theme === 'light' ? 'Light' : 'Dark'} mode</small>
          </div>
          <button className="btn btn-outline-success" onClick={toggleTheme}>
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} me-1`}></i>
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {/* Notifications & Reminders */}
      <div className="card stat-card mb-3">
        <div className="card-header bg-transparent fw-bold">
          <i className="bi bi-bell me-2"></i>Notifications & Reminders
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <small className="fw-semibold">Notification Permission</small>
              <br />
              <span className={`badge bg-${notifPermission === 'granted' ? 'success' : notifPermission === 'denied' ? 'danger' : 'warning'}`}>
                {notifPermission === 'granted' ? 'Enabled' : notifPermission === 'denied' ? 'Blocked' : notifPermission === 'unsupported' ? 'Not Supported' : 'Not Set'}
              </span>
            </div>
            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <button className="btn btn-success btn-sm" onClick={handleEnableNotifications}>
                <i className="bi bi-bell me-1"></i>Enable
              </button>
            )}
          </div>

          {reminders.map(r => (
            <div key={r.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={r.enabled}
                    onChange={() => toggleReminder(r.id)}
                    id={`reminder-${r.id}`}
                  />
                </div>
                <div>
                  <label className="form-check-label fw-semibold" htmlFor={`reminder-${r.id}`} style={{ fontSize: '0.85rem' }}>
                    {r.label}
                  </label>
                  <small className="d-block text-body-secondary">{r.message}</small>
                </div>
              </div>
              <input
                type="time"
                className="form-control form-control-sm"
                style={{ width: 100 }}
                value={r.time}
                onChange={e => updateReminderTime(r.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Anthropic API Key */}
      <div className="card stat-card mb-3">
        <div className="card-header bg-transparent fw-bold">
          <i className="bi bi-camera me-2"></i>Food Photo AI (Anthropic API)
        </div>
        <div className="card-body">
          <small className="text-body-secondary d-block mb-2">
            Your API key is <strong>encrypted</strong> and stored locally on your device only — it never leaves your phone and is never displayed after saving.
          </small>

          {hasApiKey && !editingKey ? (
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-success">
                  <i className="bi bi-shield-lock me-1"></i>API key encrypted & saved
                </span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={() => setEditingKey(true)}>
                  <i className="bi bi-pencil me-1"></i>Change Key
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleRemoveApiKey}>
                  <i className="bi bi-trash me-1"></i>Remove Key
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="input-group mb-2">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Paste your sk-ant-... key here"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-success btn-sm" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                  <i className="bi bi-shield-lock me-1"></i>Encrypt & Save
                </button>
                {hasApiKey && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => { setEditingKey(false); setApiKey(''); }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile */}
      {profile && (
        <div className="card stat-card mb-3">
          <div className="card-header bg-transparent fw-bold">Your Profile</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input name="name" className="form-control" value={profile.name || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sex</label>
                <select name="sex" className="form-select" value={profile.sex || ''} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="col-4">
                <label className="form-label">Age</label>
                <input name="age" type="number" className="form-control" value={profile.age || ''} onChange={handleChange} />
              </div>
              <div className="col-4">
                <label className="form-label">Weight (kg)</label>
                <input name="weightKg" type="number" step="0.1" className="form-control" value={profile.weightKg || ''} onChange={handleChange} />
              </div>
              <div className="col-4">
                <label className="form-label">Height (cm)</label>
                <input name="heightCm" type="number" step="0.1" className="form-control" value={profile.heightCm || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Activity Level</label>
                <select name="activityLevel" className="form-select" value={profile.activityLevel || ''} onChange={handleChange}>
                  {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Goal</label>
                <select name="goal" className="form-select" value={profile.goal || ''} onChange={handleChange}>
                  {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Weekly Change (kg)</label>
                <input name="targetWeeklyChangeKg" type="number" step="0.1" className="form-control" value={profile.targetWeeklyChangeKg || 0.5} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Daily Step Target</label>
                <input name="dailyStepTarget" type="number" className="form-control" value={profile.dailyStepTarget || 10000} onChange={handleChange} />
              </div>
            </div>
            <button className="btn btn-success mt-3" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-lg me-1"></i>}
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Data Maintenance */}
      <div className="card stat-card mb-3">
        <div className="card-header bg-transparent fw-bold">
          <i className="bi bi-wrench me-2"></i>Data Maintenance
        </div>
        <div className="card-body">
          <p className="text-body-secondary small mb-2">Remove duplicate food entries from the database.</p>
          <button className="btn btn-outline-warning btn-sm" onClick={async () => {
            try {
              const res = await cleanupDuplicates();
              addToast(res.message || `Removed ${res.data?.duplicatesRemoved} duplicates`, 'success');
            } catch (err) {
              addToast(err.message, 'danger');
            }
          }}>
            <i className="bi bi-trash me-1"></i>Remove Duplicate Foods
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="card stat-card">
        <div className="card-body text-center">
          <h6 className="fw-bold">🍽️ Justalorie</h6>
          <small className="text-body-secondary">Personal Calorie Management for Ghana</small>
          <div className="mt-2"><small className="text-body-secondary">Version 1.1.0</small></div>
        </div>
      </div>
    </div>
  );
}
