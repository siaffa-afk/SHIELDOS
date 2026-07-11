// "Fix Missing Items" — only items that block a clean handoff/clock-out.
// Each item carries a factKey; roleService translates factKeys into each
// role's vocabulary (DSP: "needs your signature"; billing: "service line hold").
import { DOC_TYPES } from '../models/documentation.model.js';
import { notesDue } from './checklistService.js';

export const FACT_KEYS = Object.freeze({
  UNSIGNED_NOTE: 'unsigned_note',
  NOTE_MISSING: 'note_missing',
  RECEIPT_MISSING: 'receipt_missing',
  INCIDENT_OPEN: 'incident_open',
  LATE_REASON_NEEDED: 'late_entry_reason',
  TRACKING_INCOMPLETE: 'tracking_incomplete',
});

/** @returns {Array<{factKey, residentId, refId, detail}>} */
export function deriveMissingItems({ shift, tasks, documents, incidents }) {
  const items = [];

  for (const n of notesDue({ shift, documents })) {
    items.push({
      factKey: n.kind === 'draft_unsigned' ? FACT_KEYS.UNSIGNED_NOTE : FACT_KEYS.NOTE_MISSING,
      residentId: n.residentId,
      refId: n.docId ?? null,
      detail: n.kind === 'draft_unsigned' ? 'Saved note needs your signature' : 'Progress note not written yet',
    });
  }

  for (const d of documents) {
    if (d.type === DOC_TYPES.RECEIPT && d.fields?.receiptAttached === false) {
      items.push({
        factKey: FACT_KEYS.RECEIPT_MISSING, residentId: d.residentId, refId: d.id,
        detail: `Money was used (${d.title}) — photo of the receipt is required`,
      });
    }
    if (d.lateReasonRequired && !d.lateReason) {
      items.push({
        factKey: FACT_KEYS.LATE_REASON_NEEDED, residentId: d.residentId, refId: d.id,
        detail: 'Tell us why this was entered late',
      });
    }
  }

  for (const i of incidents) {
    if (i.shiftId === shift.id && i.status === 'started') {
      items.push({
        factKey: FACT_KEYS.INCIDENT_OPEN, residentId: i.residentId, refId: i.id,
        detail: 'Incident report started but not submitted',
      });
    }
  }

  for (const t of tasks) {
    if (t.safetyCritical && t.status !== 'done') {
      items.push({
        factKey: FACT_KEYS.TRACKING_INCOMPLETE, residentId: t.residentId, refId: t.id,
        detail: `Required tracking not done: ${t.label}`,
      });
    }
  }

  return items;
}
