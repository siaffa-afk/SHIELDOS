// Language separation: DSP strings must never contain billing/compliance
// vocabulary; the same fact reads differently per role.
import { describe, it, expect } from 'vitest';
import { phraseFor, allDspPhrases, DSP_FORBIDDEN_TERMS } from '../src/services/roleService.js';
import { ROLES } from '../src/models/user.model.js';

describe('DSP language rules', () => {
  it('no DSP-facing phrase contains forbidden operational jargon', () => {
    for (const phrase of allDspPhrases()) {
      for (const term of DSP_FORBIDDEN_TERMS) {
        expect(phrase.toLowerCase()).not.toContain(term);
      }
    }
  });

  it('uses the required plain-language phrases', () => {
    expect(phraseFor('receipt_missing', ROLES.DSP)).toContain('Proof is missing');
    expect(phraseFor('late_entry_reason', ROLES.DSP)).toContain('why this was entered late');
  });
});

describe('same fact, different role lens', () => {
  it('translates unsigned_note per role exactly as specced', () => {
    expect(phraseFor('unsigned_note', ROLES.DSP)).toContain('Finish your note');
    expect(phraseFor('unsigned_note', ROLES.TEAM_LEAD)).toContain('Progress note');
    expect(phraseFor('unsigned_note', ROLES.BILLING_ADMIN)).toContain('Service line on hold');
    expect(phraseFor('unsigned_note', ROLES.AUDITOR)).toContain('Audit proof missing');
  });

  it('falls back to team-lead wording for roles without a specific phrase', () => {
    expect(phraseFor('training_expiring', ROLES.NURSE)).toBeTruthy();
  });
});
