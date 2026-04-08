export const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: 'bi-sunrise' },
  { value: 'LUNCH', label: 'Lunch', icon: 'bi-sun' },
  { value: 'DINNER', label: 'Dinner', icon: 'bi-moon' },
  { value: 'SNACK', label: 'Snack', icon: 'bi-cookie' },
  { value: 'DRINK', label: 'Drink', icon: 'bi-cup-straw' },
  { value: 'OTHER', label: 'Other', icon: 'bi-three-dots' },
];

export const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY', label: 'Sedentary (little/no exercise)' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active (1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately Active (3-5 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very Active (6-7 days/week)' },
  { value: 'EXTRA_ACTIVE', label: 'Extra Active (very hard exercise)' },
];

export const GOALS = [
  { value: 'MAINTAIN', label: 'Maintain Weight', icon: 'bi-arrow-left-right' },
  { value: 'LOSE', label: 'Lose Weight', icon: 'bi-arrow-down' },
  { value: 'GAIN', label: 'Gain Weight', icon: 'bi-arrow-up' },
];

export const FASTING_SCHEDULES = [
  { value: 'TWELVE_TWELVE', label: '12:12', fastH: 12, eatH: 12 },
  { value: 'FOURTEEN_TEN', label: '14:10', fastH: 14, eatH: 10 },
  { value: 'SIXTEEN_EIGHT', label: '16:8', fastH: 16, eatH: 8 },
  { value: 'EIGHTEEN_SIX', label: '18:6', fastH: 18, eatH: 6 },
  { value: 'TWENTY_FOUR', label: '20:4', fastH: 20, eatH: 4 },
  { value: 'CUSTOM', label: 'Custom', fastH: null, eatH: null },
];

export const UNITS = [
  'g', 'ml', 'piece', 'medium', 'cup', 'bowl', 'ladle', 'ball',
  'plate', 'slice', 'can', 'bottle', 'tin', 'handful', 'sachet',
  'cooking spoon', '1 serving',
];

export const CONFIDENCE_COLORS = {
  VERIFIED: 'success',
  ESTIMATED: 'warning',
  USER_ADDED: 'primary',
  LOCAL_CUSTOM: 'info',
};

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
  { path: '/foods', label: 'Food Database', icon: 'bi-search' },
  { path: '/daily-log', label: 'Daily Log', icon: 'bi-journal-text' },
  { path: '/steps', label: 'Steps', icon: 'bi-person-walking' },
  { path: '/weight', label: 'Weight', icon: 'bi-speedometer' },
  { path: '/water', label: 'Water', icon: 'bi-droplet' },
  { path: '/sleep', label: 'Sleep', icon: 'bi-moon-stars' },
  { path: '/fasting', label: 'Fasting', icon: 'bi-hourglass-split' },
  { path: '/heart-rate', label: 'Heart Rate', icon: 'bi-heart-pulse' },
  { path: '/analytics', label: 'Analytics', icon: 'bi-graph-up' },
  { path: '/tools', label: 'Tools', icon: 'bi-tools' },
  { path: '/settings', label: 'Settings', icon: 'bi-gear' },
];

export const MOBILE_NAV = [
  { path: '/', label: 'Home', icon: 'bi-house-fill' },
  { path: '/daily-log', label: 'Log', icon: 'bi-journal-text' },
  { path: '/foods', label: 'Foods', icon: 'bi-search' },
  { path: '/analytics', label: 'Stats', icon: 'bi-graph-up' },
  { path: '/tools', label: 'Tools', icon: 'bi-tools' },
];
