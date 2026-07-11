// Documentation business rules: what a valid record needs, when a late reason
// is required, and how signing works. Pure rules — persistence happens in the
// API handlers, permission checks in security/accessControl.
import { DOC_TYPES } from '../models/documentation.model.js';

export const LATE_TOLERANCE_MINUTES = 60; // after shift end → reason required

export function isLateEntry(shift, now = new Date()) {
  const cutoff = new Date(new Date(shift.endsAt).getTime() + LATE_TOLERANCE_MINUTES * 60_000);
  return now > cutoff;
}

const REQUIRED_FIELDS = {
  [DOC_TYPES.PROGRESS_NOTE]: ['body'],
  [DOC_TYPES.MEAL_LOG]: ['body'],
  [DOC_TYPES.RECEIPT]: ['fields.amount'],
  [DOC_TYPES.INCIDENT]: ['body'],
};

function fieldPresent(record, path) {
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), record) != null
    && path.split('.').reduce((v, k) => (v == null ? v : v[k]), record) !== '';
}

/** Validate a record before create/sign. Returns plain-language problems. */
export function validateDocRecord(record, { shift, now = new Date() } = {}) {
  const problems = [];
  if (!record.type) problems.push({ key: 'type', message: 'Choose what you are logging.' });
  if (!record.title) problems.push({ key: 'title', message: 'Give this entry a short title.' });
  for (const path of REQUIRED_FIELDS[record.type] ?? []) {
    if (!fieldPresent(record, path)) {
      problems.push({ key: path, message: 'This part is required before you can sign.' });
    }
  }
  if (shift && isLateEntry(shift, now) && !record.lateReason) {
    problems.push({ key: 'lateReason', message: 'Tell us why this was entered late.' });
  }
  return { ok: problems.length === 0, problems };
}

/** Sign a record → official. Signature is identity + server time, not a string. */
export function signDocRecord(record, userId, { shift, now = new Date() } = {}) {
  const check = validateDocRecord(record, { shift, now });
  if (!check.ok) return { ok: false, ...check };
  return {
    ok: true,
    record: {
      ...record,
      status: 'submitted',
      signature: { by: userId, at: now.toISOString() },
      lateReason: record.lateReason ?? null,
    },
  };
}
