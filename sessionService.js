// Mock session management. Documents the production contract:
// secure HTTP-only cookies (web), short-lived access tokens with refresh
// rotation, device/session tracking, idle timeout, MFA for elevated roles.
// Nothing sensitive is ever written to localStorage — session lives in memory.
import { newId } from '../models/recordBase.js';
import { requiresMfa } from '../models/user.model.js';

export const IDLE_TIMEOUT_MINUTES = 15;
export const MAX_FAILED_LOGINS = 5; // then lockout / step-up auth

let current = null;

export function startSession(user, { mfaVerified = false } = {}) {
  if (user.employmentStatus !== 'active') {
    return { ok: false, error: 'account_not_active' };
  }
  if (requiresMfa(user) && !mfaVerified) {
    return { ok: false, error: 'mfa_required' };
  }
  current = {
    sessionId: newId('sess'),
    userId: user.id,
    role: user.role,
    startedAt: new Date().toISOString(),
    lastActivityAt: Date.now(),
    mfaVerified,
    deviceLabel: 'demo-device',
  };
  return { ok: true, session: current };
}

export function getSession() {
  if (!current) return null;
  const idleMs = Date.now() - current.lastActivityAt;
  if (idleMs > IDLE_TIMEOUT_MINUTES * 60_000) {
    current = null; // idle timeout — user must sign in again
    return null;
  }
  return current;
}

export function touchSession() {
  if (current) current.lastActivityAt = Date.now();
}

export function endSession() {
  current = null;
}
