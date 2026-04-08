import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './layouts/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import FoodDatabase from './pages/FoodDatabase';
import FoodDetail from './pages/FoodDetail';
import AddEditFood from './pages/AddEditFood';
import DailyLog from './pages/DailyLog';
import StepsTracker from './pages/StepsTracker';
import WeightTracker from './pages/WeightTracker';
import FastingTracker from './pages/FastingTracker';
import HeartRateTracker from './pages/HeartRateTracker';
import Analytics from './pages/Analytics';
import Tools from './pages/Tools';
import CalorieCalculator from './pages/CalorieCalculator';
import Settings from './pages/Settings';
import WaterTracker from './pages/WaterTracker';
import SleepTracker from './pages/SleepTracker';
import WellnessReport from './pages/WellnessReport';
import NotFound from './pages/NotFound';

function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1500);
    const t2 = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <img src="/favicon.svg" alt="Justalorie" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 12 }} />
      <div className="splash-logo">Justalorie</div>
      <div className="splash-sub">Your Personal Calorie Companion</div>
      <div className="splash-spinner"></div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('jl-splash-shown');
  });

  const handleSplashDone = () => {
    setShowSplash(false);
    sessionStorage.setItem('jl-splash-shown', '1');
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="foods" element={<FoodDatabase />} />
              <Route path="foods/:id" element={<FoodDetail />} />
              <Route path="foods/add" element={<AddEditFood />} />
              <Route path="foods/:id/edit" element={<AddEditFood />} />
              <Route path="daily-log" element={<DailyLog />} />
              <Route path="steps" element={<StepsTracker />} />
              <Route path="weight" element={<WeightTracker />} />
              <Route path="fasting" element={<FastingTracker />} />
              <Route path="heart-rate" element={<HeartRateTracker />} />
              <Route path="water" element={<WaterTracker />} />
              <Route path="sleep" element={<SleepTracker />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="tools" element={<Tools />} />
              <Route path="tools/calculator" element={<CalorieCalculator />} />
              <Route path="tools/report" element={<WellnessReport />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
