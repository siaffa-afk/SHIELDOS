// Guided handoff: structured sections, never a blank text box. Sections are
// auto-filled from the shift's completed documentation (handoffService) and
// the outgoing DSP reviews + confirms rather than retyping.
import { withRecordMeta } from './recordBase.js';

/** Ordered section definitions. `askIf` lets house config drop sections. */
export const HANDOFF_SECTIONS = Object.freeze([
  { key: 'residentDay',    label: 'How was each resident today?', required: true },
  { key: 'health',         label: 'Any health concerns?', required: true },
  { key: 'behavior',       label: 'Any behavior concerns?', required: true },
  { key: 'meals',          label: 'Meals and snacks completed?', required: true },
  { key: 'toileting',      label: 'Toileting / bowel movement updates', required: false, askIf: 'trackToileting' },
  { key: 'appointments',   label: 'Appointments, outings, and follow-ups', required: false },
  { key: 'incidents',      label: 'Incidents this shift', required: true },
  { key: 'money',          label: 'Receipts or money used', required: false },
  { key: 'supplies',       label: 'Supplies needed', required: false },
  { key: 'houseConcerns',  label: 'House concerns', required: false },
  { key: 'nextShift',      label: 'Anything the next shift must know?', required: true },
]);

/**
 * @typedef {Object} HandoffRecord
 * @property {string} shiftId
 * @property {string} houseId
 * @property {Object<string, {text: string, autoFilled: boolean, confirmed: boolean}>} sections
 * @property {'draft'|'sent'|'acknowledged'} status
 * @property {?string} acknowledgedBy  incoming staff member
 */

export function createHandoff(fields, actorId) {
  return withRecordMeta('hnd', {
    shiftId: fields.shiftId,
    houseId: fields.houseId,
    residentIds: fields.residentIds ?? [],
    sections: fields.sections ?? {},
    status: 'draft',
    sentAt: null,
    acknowledgedBy: null,
  }, actorId, { houseId: fields.houseId });
}

/** Required sections must be confirmed (auto-filled text still needs review). */
export function missingHandoffSections(handoff, houseConfig = {}) {
  return HANDOFF_SECTIONS.filter((s) => {
    if (s.askIf && !houseConfig[s.askIf]) return false;
    const entry = handoff.sections[s.key];
    return s.required && !(entry && entry.confirmed);
  });
}
