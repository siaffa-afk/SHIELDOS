// Authorization tests: role access, object-level checks, field filtering,
// and API-boundary enforcement (frontend hiding is not security).
import { describe, it, expect, beforeAll } from 'vitest';
import { authorize } from '../src/security/accessControl.js';
import { filterResidentFields } from '../src/security/fieldFilterService.js';
import { mockUsers } from '../src/data/mockUsers.js';
import { mockResidents } from '../src/data/mockResidents.js';
import { handleRequest } from '../src/api/mockServer.js';
import { startSession, endSession } from '../src/security/sessionService.js';
import { ENDPOINTS } from '../src/api/endpoints.js';

const user = (id) => mockUsers.find((u) => u.id === id);
const resident = (id) => mockResidents.find((r) => r.id === id);
const dspShift = { id: 'sh1', houseId: 'h1', residentIds: ['r1', 'r2'] };

describe('object-level authorization', () => {
  it('DSP can view an assigned resident during an active shift', () => {
    const result = authorize(user('u1'), 'view_resident', resident('r1'), { activeShift: dspShift });
    expect(result.allowed).toBe(true);
  });

  it('DSP cannot view an unassigned resident (other house), even with a crafted id', () => {
    const result = authorize(user('u1'), 'view_resident', resident('r3'), { activeShift: dspShift });
    expect(result.allowed).toBe(false);
  });

  it('DSP has no assignment access without an active shift', () => {
    const result = authorize(user('u1'), 'view_resident', resident('r1'), { activeShift: null });
    expect(result.allowed).toBe(false);
  });

  it('DSP cannot view billing; billing admin and owner can', () => {
    expect(authorize(user('u1'), 'view_billing').allowed).toBe(false);
    expect(authorize(user('u7'), 'view_billing').allowed).toBe(true);
    expect(authorize(user('u9'), 'view_billing').allowed).toBe(true);
  });

  it('auditor only reaches records inside the approved window scope', () => {
    const auditor = user('u8');
    expect(authorize(auditor, 'view_document', { id: 'd1', residentId: 'r1' }).allowed).toBe(true);
    expect(authorize(auditor, 'view_document', { id: 'd999', residentId: 'r4' }).allowed).toBe(false);
  });

  it('driver capability overrides deny document access', () => {
    expect(authorize(user('u10'), 'view_document', { residentId: 'r1' },
      { activeShift: { id: 'sh3', houseId: 'h1', residentIds: ['r1'] } }).allowed).toBe(false);
  });
});

describe('field-level filtering', () => {
  it('drivers never receive medical fields', () => {
    const filtered = filterResidentFields(resident('r1'), 'driver');
    expect(filtered.name).toBeDefined();
    expect(filtered.medications).toBeUndefined();
    expect(filtered.diagnoses).toBeUndefined();
    expect(filtered.dob).toBeUndefined();
  });

  it('DSPs receive clinical care fields but not admin/billing fields', () => {
    const filtered = filterResidentFields(resident('r1'), 'dsp');
    expect(filtered.allergies).toBeDefined();
    expect(filtered.medications).toBeDefined();
    expect(filtered.authorizedHours).toBeUndefined();
    expect(filtered.waiverProgram).toBeUndefined();
  });
});

describe('API boundary enforcement', () => {
  beforeAll(() => { endSession(); });

  it('rejects unauthenticated requests', async () => {
    await expect(handleRequest(ENDPOINTS.GET_BILLING_QUEUE.path)).rejects
      .toMatchObject({ code: 'unauthenticated' });
  });

  it('DSP is refused at the billing endpoint (server-side, not UI)', async () => {
    startSession(user('u1'));
    await expect(handleRequest(ENDPOINTS.GET_BILLING_QUEUE.path)).rejects
      .toMatchObject({ code: 'forbidden' });
    endSession();
  });

  it('billing admin gets the billing queue with role-appropriate language', async () => {
    startSession(user('u7'), { mfaVerified: true });
    const queue = await handleRequest(ENDPOINTS.GET_BILLING_QUEUE.path);
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].message.toLowerCase()).toContain('hold');
    endSession();
  });

  it('unauthorized resident fetch returns not_found (no existence leak)', async () => {
    startSession(user('u1')); // DSP, shift not active in this test db state
    await expect(handleRequest(ENDPOINTS.GET_RESIDENT.path, { residentId: 'r4' }))
      .rejects.toMatchObject({ code: 'not_found' });
    endSession();
  });

  it('elevated roles cannot start a session without MFA', () => {
    const result = startSession(user('u9'), { mfaVerified: false });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('mfa_required');
  });
});
