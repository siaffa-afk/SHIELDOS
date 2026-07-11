// Documentation records: progress notes, care logs, meals, tracking, receipts,
// incidents. Corrections never overwrite — they create a new version that
// supersedes the old one (supersedesId chain). Late entries require a reason.
import { withRecordMeta } from './recordBase.js';

export const DOC_TYPES = Object.freeze({
  PROGRESS_NOTE: 'progress_note',
  CARE_LOG: 'care_log',
  MEAL_LOG: 'meal_log',
  ROUTINE_LOG: 'routine_log',
  GOAL_TRACKING: 'goal_tracking',
  RECEIPT: 'receipt',
  INCIDENT: 'incident',
  APPOINTMENT_OUTCOME: 'appointment_outcome',
});

export const DOC_STATUS = Object.freeze({
  DRAFT: 'draft',            // autosaved, not official
  SUBMITTED: 'submitted',    // signed by author — official
  NEEDS_REVIEW: 'needs_review',
  RETURNED: 'returned',      // reviewer sent back with a reason
  APPROVED: 'approved',
});

/**
 * @typedef {Object} DocumentationRecord
 * @property {string} type        one of DOC_TYPES
 * @property {string} residentId
 * @property {string} shiftId
 * @property {number} version
 * @property {?string} supersedesId  set on corrections; original is retained
 * @property {?string} lateReason    required when submitted after the shift window
 * @property {?{by: string, at: string}} signature
 */

export function createDocRecord(fields, actorId) {
  return withRecordMeta('doc', {
    type: fields.type,
    residentId: fields.residentId ?? null,
    houseId: fields.houseId ?? null,
    shiftId: fields.shiftId ?? null,
    title: fields.title,
    body: fields.body ?? '',
    fields: fields.fields ?? {},
    status: fields.status ?? DOC_STATUS.DRAFT,
    version: fields.version ?? 1,
    supersedesId: fields.supersedesId ?? null,
    lateReason: fields.lateReason ?? null,
    signature: fields.signature ?? null,
    reviewerId: fields.reviewerId ?? null,
    returnReason: fields.returnReason ?? null,
    attachmentIds: fields.attachmentIds ?? [],
    requiredForShift: fields.requiredForShift ?? false,
  }, actorId, { houseId: fields.houseId ?? null, residentId: fields.residentId ?? null });
}

export function isOfficial(doc) {
  return doc.status !== DOC_STATUS.DRAFT && !!doc.signature;
}

/** A correction is a new record; the original stays queryable. */
export function createCorrection(original, changes, reason, actorId) {
  return createDocRecord({
    ...original,
    ...changes,
    status: DOC_STATUS.SUBMITTED,
    version: original.version + 1,
    supersedesId: original.id,
    fields: { ...original.fields, ...(changes.fields ?? {}), correctionReason: reason },
  }, actorId);
}
