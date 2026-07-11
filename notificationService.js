// In-app notifications. Rule from the role audit: only notify what has an
// owner AND a next action — everything else is a report, not an alert.
import { newId } from '../models/recordBase.js';

const notifications = [];
const listeners = new Set();

export function notify({ toUserId, toRole, severity = 'info', message, actionKey }) {
  if (!message || (!toUserId && !toRole)) return null;
  const n = {
    id: newId('ntf'),
    toUserId: toUserId ?? null,
    toRole: toRole ?? null,
    severity, // 'info' | 'attention' | 'critical'
    message,
    actionKey: actionKey ?? null,
    at: new Date().toISOString(),
    acknowledged: false,
  };
  notifications.push(n);
  listeners.forEach((fn) => fn(n));
  return n;
}

export function notificationsFor(user) {
  return notifications.filter((n) =>
    !n.acknowledged && (n.toUserId === user.id || n.toRole === user.role));
}

/** Only critical items badge the top nav — no alert fatigue. */
export function criticalCount(user) {
  return notificationsFor(user).filter((n) => n.severity === 'critical').length;
}

export function acknowledge(id) {
  const n = notifications.find((x) => x.id === id);
  if (n) n.acknowledged = true;
}

export function onNotification(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
