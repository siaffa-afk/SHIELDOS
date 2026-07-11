// Object-level authorization. Every mock-API route calls authorize() before
// touching data — UI hiding is presentation, never security. Production ports
// this exact contract to the server (API scope resolver + Postgres RLS).
import { ROLE_GRANTS } from '../models/permission.model.js';
import { accessWindowOpen } from '../models/user.model.js';
import { mockPermissionOverrides } from '../data/mockPermissions.js';
import { activeGrant } from './breakGlassService.js';

function overridesFor(userId) {
  return mockPermissionOverrides.find((o) => o.userId === userId) ?? null;
}

function denied(reason) {
  return { allowed: false, reason };
}

function scopeSatisfied(scope, user, object, ctx) {
  if (scope === 'org') return true;
  if (scope === 'window') return windowScopeOk(user, object);
  if (scope === 'house') {
    return !object?.houseId || user.houseIds.includes(object.houseId);
  }
  if (scope === 'assigned') {
    if (!ctx.activeShift) return false; // assignment access only during a shift
    const resOk = !object?.residentId
      || ctx.activeShift.residentIds.includes(object.residentId);
    const houseOk = !object?.houseId || object.houseId === ctx.activeShift.houseId;
    return resOk && houseOk;
  }
  return false;
}

function windowScopeOk(user, object) {
  if (!accessWindowOpen(user)) return false;
  const ov = overridesFor(user.id);
  if (!ov) return false; // window roles must have an explicit scope list
  if (object?.residentId && !ov.allowedResidentIds?.includes(object.residentId)) return false;
  if (object?.id && ov.allowedRecordIds && !ov.allowedRecordIds.includes(object.id)) return false;
  return true;
}

/**
 * @param {Object} user      full user record
 * @param {string} capability one of CAPABILITIES
 * @param {?Object} object   record being touched ({residentId, houseId, id...})
 * @param {Object} ctx       { activeShift } — resolved by the API layer
 * @returns {{allowed: boolean, reason?: string, viaBreakGlass?: boolean}}
 */
export function authorize(user, capability, object = null, ctx = {}) {
  if (!user) return denied('no_session');
  if (user.employmentStatus !== 'active') return denied('account_not_active');
  if (!accessWindowOpen(user)) return denied('access_window_closed');

  const ov = overridesFor(user.id);
  if (ov?.denyCapabilities?.includes(capability)) return denied('capability_denied');

  // Break-glass: emergency-scoped read access to a resident's safety info.
  if (object?.residentId && capability.startsWith('view')) {
    const grant = activeGrant(user.id, object.residentId);
    if (grant) return { allowed: true, viaBreakGlass: true };
  }

  const scope = ROLE_GRANTS[user.role]?.[capability];
  if (!scope) return denied('role_lacks_capability');
  if (!scopeSatisfied(scope, user, object, ctx)) return denied('out_of_scope');
  return { allowed: true };
}

/** Convenience wrappers matching the permission-service contract. */
export const canViewResident = (u, r, ctx) => authorize(u, 'view_resident', { residentId: r.id ?? r, houseId: r.houseId }, ctx).allowed;
export const canViewBilling = (u) => authorize(u, 'view_billing').allowed;
export const canExportAuditPacket = (u) => authorize(u, 'export_audit_packet').allowed;
export const canUseBreakGlass = (u) => authorize(u, 'use_break_glass', null, {}).allowed
  || ROLE_GRANTS[u?.role]?.use_break_glass != null;
