import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatDateTime(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function formatTime(date) {
  return dayjs(date).format('h:mm A');
}

export function formatDateKey(date = new Date()) {
  return dayjs(date).format('YYYY-MM-DD');
}

export function timeAgo(date) {
  return dayjs(date).fromNow();
}

export function formatCalories(cal) {
  if (cal === null || cal === undefined) return '—';
  return Math.round(cal).toLocaleString();
}

export function formatWeight(kg) {
  if (!kg) return '—';
  return `${kg.toFixed(1)} kg`;
}

export function formatHour(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getConfidenceLabel(level) {
  const map = {
    VERIFIED: 'Verified',
    ESTIMATED: 'Estimated',
    USER_ADDED: 'User Added',
    LOCAL_CUSTOM: 'Local Custom',
  };
  return map[level] || level;
}
