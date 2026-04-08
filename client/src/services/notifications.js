// Notification & Reminder Service
// Uses browser Notification API + localStorage for scheduling

const STORAGE_KEY = 'justalorie-reminders';

const DEFAULT_REMINDERS = [
  { id: 'breakfast', label: 'Breakfast Reminder', time: '07:00', enabled: false, message: '🍳 Time to log your breakfast!' },
  { id: 'lunch', label: 'Lunch Reminder', time: '12:30', enabled: false, message: '🍛 Don\'t forget to log your lunch!' },
  { id: 'dinner', label: 'Dinner Reminder', time: '18:30', enabled: false, message: '🍽️ Time to log your dinner!' },
  { id: 'water', label: 'Water Reminder', time: '10:00', enabled: false, message: '💧 Stay hydrated! Drink some water.' },
  { id: 'fasting', label: 'Fasting Check-in', time: '20:00', enabled: false, message: '⏱️ Check your fasting progress!' },
  { id: 'steps', label: 'Steps Reminder', time: '17:00', enabled: false, message: '🚶 Have you logged your steps today?' },
  { id: 'weight', label: 'Weight Log Reminder', time: '06:30', enabled: false, message: '⚖️ Time for your daily weigh-in!' },
];

export function getReminders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_REMINDERS;
}

export function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  scheduleReminders(reminders);
}

export function resetReminders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REMINDERS));
  return DEFAULT_REMINDERS;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const permission = await Notification.requestPermission();
  return permission;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function sendNotification(title, body, icon = '🍽️') {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'justalorie-' + Date.now(),
        vibrate: [200, 100, 200],
      });
    } catch {
      // Fallback for mobile where Notification constructor may fail
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
        });
      }
    }
  }
}

// Timer-based reminder scheduling (runs in-app while open)
let reminderIntervalId = null;

export function scheduleReminders(reminders) {
  if (reminderIntervalId) clearInterval(reminderIntervalId);

  const enabled = (reminders || getReminders()).filter(r => r.enabled);
  if (enabled.length === 0) return;

  // Track which reminders already fired today
  const firedToday = new Set();

  reminderIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayKey = now.toISOString().split('T')[0];

    enabled.forEach(r => {
      const firedKey = `${todayKey}-${r.id}`;
      if (r.time === currentTime && !firedToday.has(firedKey)) {
        firedToday.add(firedKey);
        sendNotification('Justalorie Reminder', r.message);
      }
    });
  }, 30000); // Check every 30 seconds
}

// Initialize on app load
export function initReminders() {
  const reminders = getReminders();
  if (reminders.some(r => r.enabled)) {
    scheduleReminders(reminders);
  }
}
