// Resident record. Field sensitivity tiers drive field-level filtering:
// security/fieldFilterService strips tiers a role may not receive, so the
// mock API never returns a field the caller isn't allowed to see.
import { withRecordMeta } from './recordBase.js';

/** Field tiers, least → most sensitive. */
export const FIELD_TIERS = Object.freeze({
  BASIC: 'basic',        // name, house, photo hints — anyone assigned
  CARE: 'care',          // routines, diet, goals — care staff on shift
  CLINICAL: 'clinical',  // diagnoses, meds, allergies — nurse/clinical need
  ADMIN: 'admin',        // authorizations, guardianship — admin/billing/audit
});

export const RESIDENT_FIELD_TIER = Object.freeze({
  id: 'basic', name: 'basic', preferredName: 'basic', houseId: 'basic', wingId: 'basic',
  dayStatus: 'basic', photoHint: 'basic',
  routines: 'care', diet: 'care', goals: 'care', supportNotes: 'care', staffRatio: 'care',
  dob: 'clinical', diagnoses: 'clinical', allergies: 'clinical', medications: 'clinical',
  emergencyContacts: 'clinical', riskFlags: 'clinical',
  authorizedHours: 'admin', guardianId: 'admin', waiverProgram: 'admin',
});

/**
 * @typedef {Object} Resident
 * @property {string} name
 * @property {string} houseId
 * @property {'stable'|'needs_follow_up'|'elevated'|'urgent'} dayStatus  support language, never judgment
 */

export function createResident(fields, actorId = 'system') {
  return withRecordMeta('res', {
    name: fields.name,
    preferredName: fields.preferredName ?? fields.name.split(' ')[0],
    houseId: fields.houseId,
    wingId: fields.wingId ?? null,
    dayStatus: fields.dayStatus ?? 'stable',
    photoHint: fields.photoHint ?? '🙂',
    routines: fields.routines ?? [],
    diet: fields.diet ?? null,
    goals: fields.goals ?? [],
    supportNotes: fields.supportNotes ?? '',
    staffRatio: fields.staffRatio ?? '1:3',
    dob: fields.dob ?? null,
    diagnoses: fields.diagnoses ?? [],
    allergies: fields.allergies ?? [],
    medications: fields.medications ?? [],
    emergencyContacts: fields.emergencyContacts ?? [],
    riskFlags: fields.riskFlags ?? [],
    authorizedHours: fields.authorizedHours ?? null,
    guardianId: fields.guardianId ?? null,
    waiverProgram: fields.waiverProgram ?? null,
  }, actorId, { houseId: fields.houseId, residentId: null });
}
