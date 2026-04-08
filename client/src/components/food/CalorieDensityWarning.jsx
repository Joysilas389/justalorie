/**
 * Calorie Density Warning System
 * Flags foods that are high-calorie for their volume/weight
 */

// Thresholds (kcal per 100g)
const DENSITY_LEVELS = {
  VERY_HIGH: { min: 400, label: 'Very High Density', color: 'danger', icon: 'bi-exclamation-triangle-fill', message: 'Very calorie-dense! A small amount packs a lot of calories.' },
  HIGH: { min: 250, label: 'High Density', color: 'warning', icon: 'bi-exclamation-triangle', message: 'Calorie-dense food. Watch your portions carefully.' },
  MODERATE: { min: 150, label: 'Moderate', color: 'info', icon: 'bi-info-circle', message: 'Moderate calorie density.' },
  LOW: { min: 0, label: 'Low Density', color: 'success', icon: 'bi-check-circle', message: 'Low calorie density — you can eat more of this.' },
};

export function getCalorieDensityLevel(caloriesPer100g) {
  if (caloriesPer100g >= DENSITY_LEVELS.VERY_HIGH.min) return DENSITY_LEVELS.VERY_HIGH;
  if (caloriesPer100g >= DENSITY_LEVELS.HIGH.min) return DENSITY_LEVELS.HIGH;
  if (caloriesPer100g >= DENSITY_LEVELS.MODERATE.min) return DENSITY_LEVELS.MODERATE;
  return DENSITY_LEVELS.LOW;
}

export function shouldShowWarning(caloriesPer100g) {
  return caloriesPer100g >= DENSITY_LEVELS.HIGH.min;
}

export default function CalorieDensityBadge({ caloriesPer100g, showAlways = false }) {
  const level = getCalorieDensityLevel(caloriesPer100g);

  if (!showAlways && !shouldShowWarning(caloriesPer100g)) return null;

  return (
    <span className={`badge bg-${level.color} d-inline-flex align-items-center gap-1`} title={level.message} style={{ fontSize: '0.7rem' }}>
      <i className={`bi ${level.icon}`}></i>
      {level.label}
    </span>
  );
}

export function CalorieDensityAlert({ caloriesPer100g, foodName }) {
  if (!shouldShowWarning(caloriesPer100g)) return null;

  const level = getCalorieDensityLevel(caloriesPer100g);

  return (
    <div className={`alert alert-${level.color} py-2 mb-2 d-flex align-items-start gap-2`}>
      <i className={`bi ${level.icon} mt-1`}></i>
      <div>
        <small className="fw-bold">{level.label}: {caloriesPer100g} kcal/100g</small>
        <br />
        <small>{foodName ? `${foodName} is a ${level.label.toLowerCase()} food. ` : ''}{level.message}</small>
      </div>
    </div>
  );
}
