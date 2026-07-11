// Handoff rules: auto-fill from documentation, required-section gating.
import { describe, it, expect } from 'vitest';
import { buildHandoffDraft, validateHandoff, sendHandoff } from '../src/services/handoffService.js';
import { HANDOFF_SECTIONS } from '../src/models/handoff.model.js';

const shift = { id: 's1', houseId: 'h1', residentIds: ['r1'] };
const residents = [{ id: 'r1', preferredName: 'James', dayStatus: 'stable' }];
const documents = [
  { type: 'meal_log', title: 'Breakfast', body: 'Ate well.', signature: { by: 'u1' } },
  { type: 'receipt', title: 'Pharmacy co-pay $12.40', signature: null },
];
const incidents = [{ summary: 'Slip, no injury', status: 'submitted' }];

function draft() {
  return buildHandoffDraft(
    { shift, documents, incidents, appointments: [], residents }, 'u1',
  );
}

describe('handoff auto-fill', () => {
  it('pre-fills meals, incidents, and money from the shift documentation', () => {
    const h = draft();
    expect(h.sections.meals.text).toContain('Breakfast');
    expect(h.sections.meals.autoFilled).toBe(true);
    expect(h.sections.incidents.text).toContain('Slip');
    expect(h.sections.money.text).toContain('Pharmacy');
  });

  it('auto-filled sections still require explicit confirmation', () => {
    const h = draft();
    expect(h.sections.meals.confirmed).toBe(false);
  });
});

describe('handoff gating', () => {
  it('cannot be sent while required sections are unconfirmed', () => {
    const h = draft();
    const result = sendHandoff(h, { trackToileting: true });
    expect(result.ok).toBe(false);
    expect(result.missingSections.length).toBeGreaterThan(0);
    expect(h.status).toBe('draft');
  });

  it('sends once every required section is confirmed', () => {
    const h = draft();
    for (const s of HANDOFF_SECTIONS) {
      h.sections[s.key] = { ...h.sections[s.key], text: h.sections[s.key].text || 'Nothing to report.', confirmed: true };
    }
    const result = sendHandoff(h, { trackToileting: true });
    expect(result.ok).toBe(true);
    expect(h.status).toBe('sent');
  });

  it('house config drops sections that do not apply (no busywork)', () => {
    const h = draft();
    const { missingSections } = validateHandoff(h, { trackToileting: false });
    expect(missingSections.map((m) => m.key)).not.toContain('toileting');
  });
});
