// One system, one truth, different role lenses. The same factKey is worded
// differently per role — DSPs never see billing/compliance vocabulary.
// tests/roleLanguage.test.js enforces the forbidden-terms rule.
import { ROLES } from '../models/user.model.js';

/** Terms that must NEVER appear in DSP-facing strings. */
export const DSP_FORBIDDEN_TERMS = Object.freeze([
  'billing hold', 'claim hold', 'revenue risk', 'revenue at risk', 'units blocked',
  'claim support', 'audit packet', 'compliance exposure', 'authorization mismatch',
  'export-ready', 'service line', 'financial impact',
]);

const FACT_LANGUAGE = Object.freeze({
  unsigned_note: {
    [ROLES.DSP]: 'Finish your note — it needs your signature.',
    [ROLES.TEAM_LEAD]: 'Progress note unsigned.',
    [ROLES.NURSE]: 'Documentation unsigned — review not started.',
    [ROLES.BILLING_ADMIN]: 'Service line on hold until documentation is signed and reviewed.',
    [ROLES.AUDITOR]: 'Audit proof missing: unsigned progress note.',
    [ROLES.OWNER]: 'Documentation gap: unsigned note (billing on hold).',
  },
  note_missing: {
    [ROLES.DSP]: 'Write your note for this resident.',
    [ROLES.TEAM_LEAD]: 'Progress note missing.',
    [ROLES.NURSE]: 'Progress note missing.',
    [ROLES.BILLING_ADMIN]: 'Claim cannot be supported — progress note missing.',
    [ROLES.AUDITOR]: 'Audit proof missing: no progress note for the service period.',
    [ROLES.OWNER]: 'Documentation gap: progress note missing.',
  },
  receipt_missing: {
    [ROLES.DSP]: 'Proof is missing — add a photo of the receipt.',
    [ROLES.TEAM_LEAD]: 'Receipt not attached to spend entry.',
    [ROLES.BILLING_ADMIN]: 'Spend entry lacks receipt — reimbursement/claim support incomplete.',
    [ROLES.AUDITOR]: 'Audit proof missing: receipt for recorded spend.',
    [ROLES.OWNER]: 'Receipt missing on resident spend.',
  },
  incident_open: {
    [ROLES.DSP]: 'Finish and send your incident report before your shift is complete.',
    [ROLES.TEAM_LEAD]: 'Incident report started, not submitted.',
    [ROLES.NURSE]: 'Incident awaiting clinical review.',
    [ROLES.BILLING_ADMIN]: 'Incident unresolved — documentation review pending.',
    [ROLES.AUDITOR]: 'Incident record incomplete: submission not finalized.',
    [ROLES.OWNER]: 'Open incident needs follow-through.',
  },
  late_entry_reason: {
    [ROLES.DSP]: 'Tell us why this was entered late.',
    [ROLES.TEAM_LEAD]: 'Late entry — reason required.',
    [ROLES.BILLING_ADMIN]: 'Late documentation — reason on file required before release.',
    [ROLES.AUDITOR]: 'Late entry: verify documented reason.',
    [ROLES.OWNER]: 'Late entry pending explanation.',
  },
  tracking_incomplete: {
    [ROLES.DSP]: 'Finish this before your shift is complete.',
    [ROLES.TEAM_LEAD]: 'Required tracking incomplete.',
    [ROLES.NURSE]: 'Required health tracking incomplete.',
    [ROLES.BILLING_ADMIN]: 'Required tracking incomplete — documentation review blocked.',
    [ROLES.AUDITOR]: 'Required tracking record absent for period.',
    [ROLES.OWNER]: 'Required tracking incomplete.',
  },
  training_expiring: {
    [ROLES.TEAM_LEAD]: 'Team member training expires soon.',
    [ROLES.HR_TRAINING]: 'Credential expiring — schedule renewal before eligibility lapses.',
    [ROLES.OWNER]: 'Staff eligibility risk: training expiring.',
  },
});

const FALLBACK_ROLE = ROLES.TEAM_LEAD;

/** Word a fact for a role. DSPs get plain language, always. */
export function phraseFor(factKey, role) {
  const entry = FACT_LANGUAGE[factKey];
  if (!entry) return factKey.replaceAll('_', ' ');
  return entry[role] ?? entry[FALLBACK_ROLE] ?? Object.values(entry)[0];
}

export function allDspPhrases() {
  return Object.values(FACT_LANGUAGE)
    .map((entry) => entry[ROLES.DSP])
    .filter(Boolean);
}

export const ROLE_LABELS = Object.freeze({
  [ROLES.DSP]: 'Direct Support', [ROLES.TEAM_LEAD]: 'Team Lead', [ROLES.NURSE]: 'Nurse',
  [ROLES.CARE_COORDINATOR]: 'Care Coordinator', [ROLES.HR_TRAINING]: 'HR & Training',
  [ROLES.BILLING_ADMIN]: 'Billing / Admin', [ROLES.AUDITOR]: 'Auditor',
  [ROLES.OWNER]: 'Owner', [ROLES.EXTERNAL_SC]: 'Support Coordinator', [ROLES.DRIVER]: 'Driver',
});
