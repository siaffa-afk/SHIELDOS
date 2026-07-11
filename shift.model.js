// Shift + assignment + clock events. Clock in/out are records, not UI state:
// clock-out is only legal when clockOutService says the review passed.
import { withRecordMeta } from './recordBase.js';

export const SHIFT_TYPES = Object.freeze(['day', 'evening', 'overnight']);

/**
 * @typedef {Object} Shift
 * @property {string} userId
 * @property {string} houseId
 * @property {string[]} residentIds  assignment for this shift
 * @property {string} startsAt
 * @property {string} endsAt
 * @property {'scheduled'|'active'|'complete'} status
 */

export function createShift(fields, actorId = 'system') {
  return withRecordMeta('shf', {
    userId: fields.userId,
    houseId: fields.houseId,
    residentIds: fields.residentIds ?? [],
    type: fields.type ?? 'day',
    startsAt: fields.startsAt,
    endsAt: fields.endsAt,
    status: fields.status ?? 'scheduled',
    handoffSent: false,
    clockInAt: null,
    clockOutAt: null,
  }, actorId, { houseId: fields.houseId });
}

/**
 * @typedef {Object} ClockEvent
 * @property {'clock_in'|'clock_out'} kind
 * @property {string} shiftId
 * @property {?string} lateReason  required when the event is outside tolerance
 */

export function createClockEvent(fields, actorId) {
  return withRecordMeta('clk', {
    kind: fields.kind,
    shiftId: fields.shiftId,
    userId: actorId,
    at: fields.at,
    lateReason: fields.lateReason ?? null,
    unresolvedItemsRoutedTo: fields.unresolvedItemsRoutedTo ?? null,
  }, actorId, { houseId: fields.houseId });
}

export function isShiftActiveNow(shift, now = new Date()) {
  return shift.status === 'active'
    && now >= new Date(shift.startsAt) && now <= new Date(shift.endsAt);
}
