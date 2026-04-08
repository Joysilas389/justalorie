import { formatCalories } from '../../utils/format';

export default function CalorieRing({ consumed, target }) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct > 100 ? '#dc3545' : pct > 80 ? '#fd7e14' : '#198754';

  return (
    <div className="calorie-ring-container">
      <svg viewBox="0 0 140 140" width="100%" height="100%">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--bs-border-color)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="calorie-ring-text">
        <div className="fs-4 fw-bold" style={{ color }}>{formatCalories(consumed)}</div>
        <small className="text-body-secondary">of {formatCalories(target)}</small>
        <small className="text-body-secondary">kcal</small>
      </div>
    </div>
  );
}
