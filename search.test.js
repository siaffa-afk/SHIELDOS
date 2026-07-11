// Search permission filtering: unauthorized records and actions never appear.
import { describe, it, expect } from 'vitest';
import { runSearch } from '../src/services/searchService.js';
import { mockUsers } from '../src/data/mockUsers.js';
import { mockResidents } from '../src/data/mockResidents.js';

const user = (id) => mockUsers.find((u) => u.id === id);
const dspCtx = { activeShift: { id: 'sh1', houseId: 'h1', residentIds: ['r1', 'r2'] } };
const data = { residents: mockResidents, tasks: [], documents: [] };

describe('permission-aware search', () => {
  it('DSP finds assigned residents, not other houses', () => {
    const mine = runSearch('james', user('u1'), dspCtx, data);
    expect(mine.some((r) => r.id === 'r1')).toBe(true);
    const others = runSearch('darnell', user('u1'), dspCtx, data);
    expect(others.some((r) => r.kind === 'resident')).toBe(false);
  });

  it('billing actions appear for billing admin, never for DSP', () => {
    const admin = runSearch('billing', user('u7'), {}, data);
    expect(admin.some((r) => r.id === 'act_billing')).toBe(true);
    const dsp = runSearch('billing', user('u1'), dspCtx, data);
    expect(dsp.some((r) => r.id === 'act_billing')).toBe(false);
  });

  it('export audit packet is auditor/owner only', () => {
    expect(runSearch('export', user('u8'), {}, data).some((r) => r.id === 'act_export')).toBe(true);
    expect(runSearch('export', user('u1'), dspCtx, data).some((r) => r.id === 'act_export')).toBe(false);
  });

  it('emergency is reachable by everyone', () => {
    for (const id of ['u1', 'u7', 'u10']) {
      expect(runSearch('emergency', user(id), {}, data).some((r) => r.id === 'act_emergency')).toBe(true);
    }
  });

  it('short queries return nothing (no accidental data dumps)', () => {
    expect(runSearch('a', user('u9'), {}, data)).toHaveLength(0);
  });
});
