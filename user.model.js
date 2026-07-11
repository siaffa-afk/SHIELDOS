// User + session-facing identity. No shared logins: every account is a person.
// MFA required for elevated roles — enforced by security/sessionService.
import { withRecordMeta } from './recordBase.js';

export const ROLES = Object.freeze({
  DSP: 'dsp',
  TEAM_LEAD: 'team_lead',
  NURSE: 'nurse',
  CARE_COORDINATOR: 'care_coordinator',
  HR_TRAINING: 'hr_training',
  BILLING_ADMIN: 'billing_admin',
  AUDITOR: 'auditor',
  OWNER: 'owner',
  EXTERNAL_SC: 'external_sc',
  DRIVER: 'driver',
});

/** Roles that must sign in with MFA (export or elevated access). */
export const MFA_REQUIRED_ROLES = Object.freeze([
  ROLES.TEAM_LEAD, ROLES.NURSE, ROLES.HR_TRAINING, ROLES.BILLING_ADMIN,
  ROLES.AUDITOR, ROLES.OWNER,
]);

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} role            one of ROLES
 * @property {string[]} houseIds      houses the user may work in
 * @property {string[]} residentIds   assigned residents (assignment-scoped access)
 * @property {?string} supervisorId
 * @property {boolean} mfaEnrolled
 * @property {'active'|'inactive'|'suspended'} employmentStatus
 * @property {?{startsAt: string, endsAt: string}} accessWindow  externals/auditors only
 */

export function createUser(fields, actorId = 'system') {
  return withRecordMeta('usr', {
    name: fields.name,
    role: fields.role,
    houseIds: fields.houseIds ?? [],
    residentIds: fields.residentIds ?? [],
    supervisorId: fields.supervisorId ?? null,
    mfaEnrolled: fields.mfaEnrolled ?? false,
    employmentStatus: fields.employmentStatus ?? 'active',
    accessWindow: fields.accessWindow ?? null,
  }, actorId);
}

export function requiresMfa(user) {
  return MFA_REQUIRED_ROLES.includes(user.role);
}

/** External roles only exist inside an approved, unexpired access window. */
export function accessWindowOpen(user, now = new Date()) {
  if (!user.accessWindow) return true;
  const { startsAt, endsAt } = user.accessWindow;
  return now >= new Date(startsAt) && now <= new Date(endsAt);
}
