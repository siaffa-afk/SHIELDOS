// Field-level filtering: callers receive only the fields their role may see.
// The mock API applies this on every response — a driver asking for a resident
// gets name/house/day-status, never diagnoses or medications.
import { FIELD_TIERS, RESIDENT_FIELD_TIER } from '../models/resident.model.js';
import { ROLE_FIELD_TIER } from '../models/permission.model.js';

const TIER_ORDER = [FIELD_TIERS.BASIC, FIELD_TIERS.CARE, FIELD_TIERS.CLINICAL, FIELD_TIERS.ADMIN];

function tierAllowed(maxTier, fieldTier) {
  return TIER_ORDER.indexOf(fieldTier) <= TIER_ORDER.indexOf(maxTier);
}

/** Strip resident fields above the role's tier. Metadata fields pass through. */
export function filterResidentFields(resident, role) {
  const maxTier = ROLE_FIELD_TIER[role] ?? FIELD_TIERS.BASIC;
  const out = {};
  for (const [key, value] of Object.entries(resident)) {
    const tier = RESIDENT_FIELD_TIER[key];
    if (tier === undefined || tierAllowed(maxTier, tier)) out[key] = value;
  }
  return out;
}

/** Documentation records: billing/admin metadata is stripped for care roles. */
const DOC_ADMIN_FIELDS = ['reviewerId', 'returnReason'];
const CARE_ROLES = ['dsp', 'driver', 'external_sc'];

export function filterDocumentFields(doc, role) {
  if (!CARE_ROLES.includes(role)) return doc;
  const out = { ...doc };
  for (const f of DOC_ADMIN_FIELDS) delete out[f];
  return out;
}

export function filterList(items, role, filterFn) {
  return items.map((item) => filterFn(item, role));
}
