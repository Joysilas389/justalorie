/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
function calculateBMR(sex, weightKg, heightCm, age) {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

/**
 * Activity multipliers for TDEE
 */
const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

/**
 * Calculate TDEE from BMR and activity level
 */
function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return bmr * multiplier;
}

/**
 * Calculate daily calorie target based on goal
 * ~7700 kcal = 1 kg body weight
 */
function calculateDailyTarget(tdee, goal, targetWeeklyChangeKg = 0.5) {
  const dailyChange = (targetWeeklyChangeKg * 7700) / 7;
  switch (goal) {
    case 'LOSE':
      return Math.max(1200, tdee - dailyChange);
    case 'GAIN':
      return tdee + dailyChange;
    default: // MAINTAIN
      return tdee;
  }
}

/**
 * Calculate calories for a given food, quantity, and unit
 */
function calculateFoodCalories(food, quantity, unit, servingOptions = []) {
  let gramsConsumed = 0;

  // Check slice-based calculation
  if (unit === 'slice' && food.caloriesPerSlice) {
    return {
      gramsConsumed: quantity * (food.standardServingG || 30),
      caloriesTotal: quantity * food.caloriesPerSlice,
      formula: `${quantity} slice(s) × ${food.caloriesPerSlice} kcal/slice`,
    };
  }

  // Check container-based calculation (can, bottle, tin)
  if (['can', 'bottle', 'tin'].includes(unit)) {
    const containerWeight = food.packageWeightG || food.packageVolumeMl || food.standardServingG || 100;
    gramsConsumed = quantity * containerWeight;
    const cal = (gramsConsumed / 100) * food.caloriesPer100g;
    return {
      gramsConsumed,
      caloriesTotal: Math.round(cal * 10) / 10,
      formula: `${quantity} ${unit}(s) × ${containerWeight}${food.packageVolumeMl ? 'ml' : 'g'} × ${food.caloriesPer100g} kcal/100g`,
    };
  }

  // Check unit-based: piece, medium, etc.
  if (['piece', 'medium', 'unit'].includes(unit) && food.caloriesPerUnit) {
    return {
      gramsConsumed: quantity * (food.standardServingG || 100),
      caloriesTotal: Math.round(quantity * food.caloriesPerUnit * 10) / 10,
      formula: `${quantity} × ${food.caloriesPerUnit} kcal/unit`,
    };
  }

  // Check named serving options
  const servingMatch = servingOptions.find(
    s => s.label.toLowerCase() === unit.toLowerCase()
  );
  if (servingMatch) {
    gramsConsumed = quantity * servingMatch.gramsEquiv;
    const cal = (gramsConsumed / 100) * food.caloriesPer100g;
    return {
      gramsConsumed,
      caloriesTotal: Math.round(cal * 10) / 10,
      formula: `${quantity} × ${servingMatch.label} (${servingMatch.gramsEquiv}g) × ${food.caloriesPer100g} kcal/100g`,
    };
  }

  // Default: grams or ml
  if (unit === 'ml') {
    gramsConsumed = quantity; // approximate 1ml = 1g for most drinks
  } else {
    gramsConsumed = quantity; // assume grams
  }

  const cal = (gramsConsumed / 100) * food.caloriesPer100g;
  return {
    gramsConsumed,
    caloriesTotal: Math.round(cal * 10) / 10,
    formula: `${gramsConsumed}g × ${food.caloriesPer100g} kcal/100g`,
  };
}

/**
 * Calculate BMI
 */
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateDailyTarget,
  calculateFoodCalories,
  calculateBMI,
  getBMICategory,
  ACTIVITY_MULTIPLIERS,
};
