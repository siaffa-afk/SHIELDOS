// Audit log: events for key actions, append-only chain, break-glass rules,
// upload validation.
import { describe, it, expect } from 'vitest';
import { logAudit, readAudit, verifyChain } from '../src/security/auditLogService.js';
import { startBreakGlass } from '../src/security/breakGlassService.js';
import { validateUpload } from '../src/models/attachment.model.js';

const actor = { userId: 'u1', userRole: 'dsp' };

describe('audit chain', () => {
  it('appends hash-chained events and verifies the chain', async () => {
    await logAudit({ ...actor, action: 'document_created', recordId: 'd1' });
    await logAudit({ ...actor, action: 'document_signed', recordId: 'd1' });
    const check = await verifyChain();
    expect(check.ok).toBe(true);
    expect(check.count).toBeGreaterThanOrEqual(2);
  });

  it('captures who/what/when/why on each event', async () => {
    await logAudit({
      ...actor, action: 'late_reason_added', recordId: 'd9',
      reason: 'resident emergency during shift', affectsCompliance: true,
    });
    const [latest] = readAudit({ limit: 1 });
    expect(latest.userId).toBe('u1');
    expect(latest.reason).toContain('emergency');
    expect(latest.affectsCompliance).toBe(true);
    expect(latest.hash).toHaveLength(64);
  });
});

describe('break-glass access', () => {
  const nurse = { id: 'u4', role: 'nurse' };

  it('requires a real reason', () => {
    expect(startBreakGlass(nurse, { residentId: 'r1', reason: '' }).ok).toBe(false);
    expect(startBreakGlass(nurse, { residentId: 'r1', reason: 'hi' }).ok).toBe(false);
  });

  it('grants time-boxed access flagged for admin review, and logs it', async () => {
    const result = startBreakGlass(nurse, { residentId: 'r1', reason: 'seizure emergency' });
    expect(result.ok).toBe(true);
    expect(result.grant.reviewStatus).toBe('pending_admin_review');
    expect(new Date(result.grant.expiresAt) > new Date()).toBe(true);
    await new Promise((r) => setTimeout(r, 10)); // let the audit append settle
    const actions = readAudit({ limit: 5 }).map((e) => e.action);
    expect(actions).toContain('break_glass_start');
  });
});

describe('file upload validation', () => {
  it('accepts allowlisted types under the size limit', () => {
    expect(validateUpload({ mimeType: 'image/jpeg', sizeBytes: 1024 }).ok).toBe(true);
  });

  it('rejects disallowed types and oversized files', () => {
    expect(validateUpload({ mimeType: 'application/x-msdownload', sizeBytes: 10 }).ok).toBe(false);
    expect(validateUpload({ mimeType: 'image/png', sizeBytes: 99 * 1024 * 1024 }).problems)
      .toContain('file_too_large');
  });
});
