// Break-glass emergency access: one click to start, but a reason is required,
// scope is emergency-only, access expires automatically, and every grant is
// flagged for admin review. Fast in a real emergency — never a hidden backdoor.
import { newId } from '../models/recordBase.js';
import { logAudit } from './auditLogService.js';

export const BREAK_GLASS_MINUTES = 30;

const grants = [];

export function startBreakGlass(user, { residentId, reason }) {
  if (!reason || reason.trim().length < 5) {
    return { ok: false, error: 'reason_required' };
  }
  const grant = {
    id: newId('bg'),
    userId: user.id,
    residentId,
    reason: reason.trim(),
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + BREAK_GLASS_MINUTES * 60_000).toISOString(),
    reviewStatus: 'pending_admin_review',
  };
  grants.push(grant);
  logAudit({
    userId: user.id, userRole: user.role, residentId,
    action: 'break_glass_start', reason: grant.reason, affectsCompliance: true,
  });
  return { ok: true, grant };
}

export function endBreakGlass(user, grantId) {
  const grant = grants.find((g) => g.id === grantId && g.userId === user.id);
  if (!grant) return { ok: false, error: 'not_found' };
  grant.expiresAt = new Date().toISOString();
  logAudit({
    userId: user.id, userRole: user.role, residentId: grant.residentId,
    action: 'break_glass_end', affectsCompliance: true,
  });
  return { ok: true };
}

export function activeGrant(userId, residentId, now = new Date()) {
  return grants.find((g) =>
    g.userId === userId
    && (!residentId || g.residentId === residentId)
    && new Date(g.expiresAt) > now) ?? null;
}

/** Post-event review queue for admins. */
export function pendingReview() {
  return grants.filter((g) => g.reviewStatus === 'pending_admin_review');
}
