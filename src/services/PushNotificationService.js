import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import NotifeeService from './NotifeeService';
import { AppState, Vibration, Alert } from 'react-native';

const BASE_URL = API_URL || 'http://172.22.173.6:5000/api';

let lastCheckTime = 0;
const CHECK_INTERVAL = 10000;
let isChecking = false;

// ─── Bug 4 FIX: persist shown IDs with 1-hour TTL ────────────────────────────
const SHOWN_KEY = 'shownNotificationIds';
const TTL_MS    = 60 * 60 * 1000; // 1 hour

const loadShownIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(SHOWN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveShownIds = async (map) => {
  try {
    const now = Date.now();
    const cleaned = {};
    for (const [id, ts] of Object.entries(map)) {
      if (now - ts < TTL_MS) cleaned[id] = ts;
    }
    await AsyncStorage.setItem(SHOWN_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch { return map; }
};

const wasAlreadyShown = async (id) => {
  const map = await loadShownIds();
  const ts  = map[id];
  return !!(ts && Date.now() - ts < TTL_MS);
};

const markAsShown = async (id) => {
  const map = await loadShownIds();
  map[id] = Date.now();
  await saveShownIds(map);
};
// ─────────────────────────────────────────────────────────────────────────────

const getToken = async () => {
  try { return await AsyncStorage.getItem('userToken'); }
  catch { return null; }
};

const getNotifications = async () => {
  try {
    const token = await getToken();
    if (!token) return { status: 'FAILED', data: [] };
    const response = await axios.get(`${BASE_URL}/patient/notifications`, {
      headers: { token },
    });
    return response.data;
  } catch (error) {
    console.log('Fetch notifications error:', error.response?.data || error.message);
    return { status: 'FAILED', data: [] };
  }
};

const fmt12h = (time) => {
  if (!time || time.includes('AM') || time.includes('PM')) return time || '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const buildTitleBody = (notification) => {
  const formattedTime = fmt12h(notification.scheduledTime);
  const lateMatch     = notification.message?.match(/\((\d+)\s*minutes?\s*late\)/i);
  const minutesLate   = lateMatch?.[1] || '';

  switch (notification.type?.toLowerCase()) {
    case 'reminder':
      return { title: `🔔 Reminder: ${notification.taskName}`, body: `Due at ${formattedTime}` };
    case 'alert':
      return minutesLate
        ? { title: `⚠️ Alert: ${notification.taskName}`,    body: `${minutesLate} min late — Please take now` }
        : { title: `⏰ Time for: ${notification.taskName}`, body: `Scheduled at ${formattedTime}` };
    case 'missed':
      return { title: `❌ Missed: ${notification.taskName}`, body: `Was due at ${formattedTime}` };
    default:
      return { title: notification.title || '', body: notification.message || '' };
  }
};

// ─── Bug 3 FIX: one popup per check, highest priority wins ───────────────────
const PRIORITY = { missed: 0, alert: 1, reminder: 2 };

const pickHighestPriority = (list) =>
  list.sort((a, b) => (PRIORITY[a.type?.toLowerCase()] ?? 99) - (PRIORITY[b.type?.toLowerCase()] ?? 99))[0];
// ─────────────────────────────────────────────────────────────────────────────

const showAlertPopup = (title, body, data = {}) => {
  // ─── Bug 2 FIX: read AppState.currentState live, never a stale module var ──
  if (AppState.currentState !== 'active') return;

  setTimeout(() => {
    Alert.alert(
      title,
      body,
      [
        { text: 'View', onPress: () => { if (data.taskId) global.pendingNotification = data; } },
        { text: 'OK',   style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, 300); // longer delay so previous alert is fully dismissed first

  if (data.type === 'alert' || data.type === 'missed') {
    Vibration.vibrate([500, 500, 500]);
  } else {
    Vibration.vibrate(300);
  }
};

export const checkForNewNotifications = async (force = false) => {
  if (isChecking) return;

  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_INTERVAL) return;

  isChecking = true;
  lastCheckTime = now;

  try {
    const response = await getNotifications();
    if (response.status !== 'SUCCESS' || !response.data) return;

    const unread = response.data.filter(n => !n.read);
    await NotifeeService.setBadgeCount(unread.length);

    // Filter out already-shown (persisted TTL check)
    const fresh = [];
    for (const n of unread) {
      const id = n._id?.toString();
      if (!id) continue;
      if (!(await wasAlreadyShown(id))) fresh.push(n);
    }

    if (fresh.length === 0) return;

    // Pick ONE notification to popup (highest priority)
    const toPopup = pickHighestPriority([...fresh]);

    for (const notification of fresh) {
      const id        = notification._id?.toString();
      const { title, body } = buildTitleBody(notification);
      const channelId = notification.type === 'reminder' ? 'reminders' : 'alerts';
      const data      = { taskId: notification.taskId, type: notification.type, notificationId: id };

      // Tray notification for every fresh item
      await NotifeeService.showNotification(title, body, data, channelId);

      // Popup only for the top-priority one
      if (id === toPopup._id?.toString()) {
        showAlertPopup(title, body, data);
      }

      await markAsShown(id);
    }

  } catch (error) {
    console.log('Notification check error:', error);
  } finally {
    isChecking = false;
  }
};

// Module-level AppState listener — triggers check when app comes to foreground
AppState.addEventListener('change', (nextState) => {
  if (nextState === 'active') checkForNewNotifications(true);
});

export const startNotificationPolling = () => {
  checkForNewNotifications(true);
  return setInterval(() => checkForNewNotifications(), 15000);
};

export const stopNotificationPolling = (interval) => {
  if (interval) clearInterval(interval);
};

export const checkPendingNotification = (navigation) => {
  if (global.pendingNotification && navigation) {
    const { taskId } = global.pendingNotification;
    if (taskId) navigation.navigate('TaskDetails', { taskId });
    global.pendingNotification = null;
  }
};

export default {
  checkForNewNotifications,
  startNotificationPolling,
  stopNotificationPolling,
  checkPendingNotification,
};