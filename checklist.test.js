// Guided-flow logic: step derivation, blocking rules, clock-out gating.
import { describe, it, expect } from 'vitest';
import { deriveChecklist } from '../src/services/checklistService.js';
import { deriveMissingItems } from '../src/services/missingItemsService.js';
import { reviewClockOut, performClockOut } from '../src/services/clockOutService.js';

const baseShift = {
  id: 's1', houseId: 'h1', residentIds: ['r1'], status: 'active',
  planReviewedAt: '2026-07-10T09:00:00Z',
  startsAt: '2026-07-10T08:00:00Z', endsAt: '2026-07-10T16:00:00Z',
};
const signedNote = {
  id: 'd1', residentId: 'r1', type: 'progress_note', status: 'submitted',
  signature: { by: 'u1', at: 'now' }, fields: {},
};
const cleanInput = {
  shift: baseShift, tasks: [], documents: [signedNote], incidents: [], handoff: null,
};

describe('checklist derivation', () => {
  it('a fresh shift starts at step 1', () => {
    const { currentKey } = deriveChecklist({
      ...cleanInput, shift: { ...baseShift, status: 'scheduled', planReviewedAt: null },
      documents: [],
    });
    expect(currentKey).toBe('start_shift');
  });

  it('open care tasks hold the flow at Support Residents', () => {
    const { currentKey } = deriveChecklist({
      ...cleanInput,
      tasks: [{ id: 't1', kind: 'meal', status: 'open' }],
    });
    expect(currentKey).toBe('support_residents');
  });

  it('a missing progress note holds the flow at Finish Notes', () => {
    const { currentKey, steps } = deriveChecklist({ ...cleanInput, documents: [] });
    expect(currentKey).toBe('finish_notes');
    expect(steps.find((s) => s.key === 'finish_notes').counts.open).toBe(1);
  });

  it('with notes done and nothing missing, handoff is the current step', () => {
    const { currentKey } = deriveChecklist(cleanInput);
    expect(currentKey).toBe('send_handoff');
  });

  it('clock out becomes current only after the handoff is sent', () => {
    const { currentKey } = deriveChecklist({
      ...cleanInput, handoff: { status: 'sent', sections: {} },
    });
    expect(currentKey).toBe('clock_out');
  });
});

describe('missing items', () => {
  it('detects unsigned drafts, missing receipts, open incidents, safety tracking', () => {
    const items = deriveMissingItems({
      shift: baseShift,
      tasks: [{ id: 't1', kind: 'routine', status: 'open', safetyCritical: true, label: 'Seizure watch' }],
      documents: [
        signedNote,
        { id: 'd2', residentId: 'r1', type: 'care_log', status: 'draft', fields: {} },
        { id: 'd3', residentId: 'r1', type: 'receipt', status: 'draft', fields: { receiptAttached: false } },
      ],
      incidents: [{ id: 'i1', shiftId: 's1', residentId: 'r1', status: 'started' }],
    });
    const keys = items.map((i) => i.factKey);
    expect(keys).toContain('unsigned_note');
    expect(keys).toContain('receipt_missing');
    expect(keys).toContain('incident_open');
    expect(keys).toContain('tracking_incomplete');
  });
});

describe('clock-out review', () => {
  it('is ready only when notes, handoff, and missing items are clear', () => {
    const review = reviewClockOut({
      ...cleanInput, handoff: { status: 'sent', sections: {} },
    });
    expect(review.ready).toBe(true);
    expect(review.headline).toBe('Ready to clock out');
  });

  it('reports exactly what needs attention, in plain words', () => {
    const review = reviewClockOut({ ...cleanInput, documents: [] });
    expect(review.ready).toBe(false);
    expect(review.headline).toContain('need');
  });

  it('hard-blocks clock-out until the handoff is sent, even with force', () => {
    const result = performClockOut({ ...cleanInput }, { force: true });
    expect(result.ok).toBe(false);
    expect(result.hardBlock).toBe('handoff_not_sent');
  });

  it('force clock-out routes open items to the supervisor', () => {
    const input = {
      ...cleanInput,
      documents: [signedNote,
        { id: 'd3', residentId: 'r1', type: 'receipt', status: 'draft', fields: { receiptAttached: false } }],
      handoff: { status: 'sent', sections: {} },
    };
    const result = performClockOut(input, { force: true });
    expect(result.ok).toBe(true);
    expect(result.routedToSupervisor.length).toBe(1);
    expect(result.message).toContain('sent to your supervisor');
  });
});
