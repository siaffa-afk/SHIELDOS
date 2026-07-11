// Derives the DSP guided checklist from facts (shift, tasks, documents,
// incidents, handoff). Pure functions — used by the mock API and by tests;
// the UI never computes its own progress.
import { deriveMissingItems } from './missingItemsService.js';
import { DOC_TYPES } from '../models/documentation.model.js';

export const STEP_KEYS = Object.freeze([
  'start_shift', 'review_plan', 'support_residents', 'finish_notes',
  'fix_missing', 'send_handoff', 'clock_out',
]);

function careTasks(tasks) {
  return tasks.filter((t) => ['care', 'meal', 'routine', 'goal'].includes(t.kind));
}

/** Notes still owed this shift: one signed progress note per resident + drafts. */
export function notesDue({ shift, documents }) {
  const due = [];
  for (const rid of shift.residentIds) {
    const signedNote = documents.find((d) =>
      d.residentId === rid && d.type === DOC_TYPES.PROGRESS_NOTE && d.signature);
    if (!signedNote) due.push({ residentId: rid, kind: 'progress_note_missing' });
  }
  for (const d of documents) {
    if (d.status === 'draft' && d.type !== DOC_TYPES.RECEIPT) {
      due.push({ residentId: d.residentId, kind: 'draft_unsigned', docId: d.id });
    }
  }
  return due;
}

function stepFacts(input) {
  const { shift, tasks, documents, incidents, handoff } = input;
  const openCare = careTasks(tasks).filter((t) => t.status !== 'done');
  const missing = deriveMissingItems(input);
  return {
    started: shift.status === 'active' || shift.status === 'complete',
    planReviewed: !!shift.planReviewedAt,
    openCareCount: openCare.length,
    notes: notesDue({ shift, documents }),
    missing,
    handoffSent: !!(handoff && handoff.status !== 'draft'),
    clockedOut: shift.status === 'complete',
    safetyAlert: incidents.some((i) => i.status === 'started' && i.requiresNurseReview),
  };
}

function stepDone(key, f) {
  switch (key) {
    case 'start_shift': return f.started;
    case 'review_plan': return f.planReviewed;
    case 'support_residents': return f.started && f.openCareCount === 0;
    case 'finish_notes': return f.started && f.notes.length === 0;
    case 'fix_missing': return f.started && f.missing.length === 0;
    case 'send_handoff': return f.handoffSent;
    case 'clock_out': return f.clockedOut;
    default: return false;
  }
}

function blockReason(key, f) {
  if (key === 'send_handoff' && f.missing.length > 0) return 'missing_items_open';
  if (key === 'clock_out' && !f.handoffSent) return 'handoff_not_sent';
  if (key === 'clock_out' && f.missing.length > 0) return 'missing_items_open';
  return null;
}

/**
 * @returns {{steps: Array, currentKey: string, facts: Object}}
 * Each step: { key, index, status: 'done'|'current'|'upcoming'|'blocked',
 *              counts, blockReason }
 */
export function deriveChecklist(input) {
  const facts = stepFacts(input);
  const doneFlags = STEP_KEYS.map((k) => stepDone(k, facts));
  const firstOpen = doneFlags.findIndex((d) => !d);
  const currentIdx = firstOpen === -1 ? STEP_KEYS.length - 1 : firstOpen;

  const steps = STEP_KEYS.map((key, i) => {
    let status = 'upcoming';
    if (doneFlags[i]) status = 'done';
    else if (i === currentIdx) status = blockReason(key, facts) ? 'blocked' : 'current';
    return {
      key, index: i + 1, status,
      blockReason: i === currentIdx ? blockReason(key, facts) : null,
      counts: countsFor(key, facts),
    };
  });
  return { steps, currentKey: STEP_KEYS[currentIdx], facts };
}

function countsFor(key, f) {
  if (key === 'support_residents') return { open: f.openCareCount };
  if (key === 'finish_notes') return { open: f.notes.length };
  if (key === 'fix_missing') return { open: f.missing.length };
  return {};
}
