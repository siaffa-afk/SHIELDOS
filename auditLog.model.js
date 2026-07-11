// Audit events are append-only and hash-chained. The prototype chains with
// SHA-256 over (prevHash + payload); production anchors the chain server-side.
// The old prototype's djb2 "integrity chain" was NOT tamper-evident — replaced.

export const AUDIT_ACTIONS = Object.freeze([
  'login', 'logout', 'login_failed', 'mfa_challenge',
  'role_change', 'permission_change',
  'resident_viewed', 'document_created', 'document_edited', 'document_signed',
  'document_corrected', 'late_reason_added',
  'attachment_uploaded', 'attachment_downloaded', 'attachment_deleted',
  'incident_started', 'incident_submitted', 'incident_closed',
  'handoff_sent', 'clock_in', 'clock_out',
  'admin_review', 'billing_status_change', 'audit_packet_export',
  'break_glass_start', 'break_glass_end', 'access_denied', 'search',
]);

/**
 * @typedef {Object} AuditEvent
 * @property {string} id
 * @property {string} at            server timestamp in production
 * @property {string} userId
 * @property {string} userRole
 * @property {?string} houseId
 * @property {?string} residentId
 * @property {?string} recordType
 * @property {?string} recordId
 * @property {string} action        one of AUDIT_ACTIONS
 * @property {?string} reason       late/corrected/deleted/overridden/break-glass
 * @property {?{old: *, new: *}} change
 * @property {string} sessionId
 * @property {?string} routedTo     where the action sent work (e.g. supervisor)
 * @property {boolean} affectsCompliance  touched handoff/review/billing/audit readiness
 * @property {string} prevHash
 * @property {string} hash
 */

export function buildAuditEvent(fields, prevHash, seq) {
  return {
    id: `aud_${seq}`,
    at: fields.at ?? new Date().toISOString(),
    userId: fields.userId,
    userRole: fields.userRole,
    houseId: fields.houseId ?? null,
    residentId: fields.residentId ?? null,
    recordType: fields.recordType ?? null,
    recordId: fields.recordId ?? null,
    action: fields.action,
    reason: fields.reason ?? null,
    change: fields.change ?? null,
    sessionId: fields.sessionId ?? 'sess_demo',
    routedTo: fields.routedTo ?? null,
    affectsCompliance: fields.affectsCompliance ?? false,
    prevHash,
    hash: '', // set by auditLogService after hashing
  };
}
