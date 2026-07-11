// Documentation routing: every record type has exactly one review owner, so
// nothing sits unowned. Also routes unfinished clock-out items to supervisors.
import { DOC_TYPES } from '../models/documentation.model.js';
import { ROLES } from '../models/user.model.js';

/** Single review owner per record type (docs/09 §8: one owner, no overlap). */
export const REVIEW_OWNER = Object.freeze({
  [DOC_TYPES.PROGRESS_NOTE]: ROLES.TEAM_LEAD,
  [DOC_TYPES.CARE_LOG]: ROLES.TEAM_LEAD,
  [DOC_TYPES.MEAL_LOG]: ROLES.TEAM_LEAD,
  [DOC_TYPES.ROUTINE_LOG]: ROLES.TEAM_LEAD,
  [DOC_TYPES.GOAL_TRACKING]: ROLES.TEAM_LEAD,
  [DOC_TYPES.RECEIPT]: ROLES.BILLING_ADMIN,
  [DOC_TYPES.INCIDENT]: ROLES.NURSE,          // health first; lead sees closure
  [DOC_TYPES.APPOINTMENT_OUTCOME]: ROLES.CARE_COORDINATOR,
});

/** Where a submitted record goes next. */
export function routeDocument(record) {
  const ownerRole = REVIEW_OWNER[record.type] ?? ROLES.TEAM_LEAD;
  return {
    recordId: record.id,
    ownerRole,
    queue: record.type === DOC_TYPES.RECEIPT ? 'billing' : 'review',
    reason: record.supersedesId ? 'correction_review' : 'standard_review',
  };
}

/** Route unfinished items at clock-out to the DSP's supervisor. */
export function routeUnfinishedItems(items, user) {
  return items.map((item) => ({
    ...item,
    routedToUserId: user.supervisorId ?? null,
    routedToRole: user.supervisorId ? null : ROLES.TEAM_LEAD,
    routedAt: new Date().toISOString(),
    status: 'open',
  }));
}

/** Incidents that meet reporting thresholds also notify leadership. */
export function incidentEscalation(incident) {
  const escalations = [];
  if (incident.requiresNurseReview) escalations.push(ROLES.NURSE);
  if (['injury', 'er_visit', 'medication_error'].includes(incident.kind)) {
    escalations.push(ROLES.TEAM_LEAD, ROLES.OWNER);
  }
  return escalations;
}
