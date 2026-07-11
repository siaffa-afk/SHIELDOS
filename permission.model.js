// Permission scopes. Access is never role-alone: every check combines
// role + house + resident assignment + active shift + scope + access window
// + break-glass status. See security/accessControl.js for evaluation.
import { ROLES } from './user.model.js';
import { FIELD_TIERS } from './resident.model.js';

export const CAPABILITIES = Object.freeze({
  VIEW_RESIDENT: 'view_resident',
  EDIT_RESIDENT: 'edit_resident',
  CREATE_DOCUMENTATION: 'create_documentation',
  REVIEW_DOCUMENTATION: 'review_documentation',
  VIEW_DOCUMENT: 'view_document',
  VIEW_BILLING: 'view_billing',
  VIEW_COMPLIANCE: 'view_compliance',
  VIEW_AUDIT_LOG: 'view_audit_log',
  EXPORT_AUDIT_PACKET: 'export_audit_packet',
  USE_BREAK_GLASS: 'use_break_glass',
  VIEW_ATTACHMENT: 'view_attachment',
  CLOCK_IN: 'clock_in',
  CLOCK_OUT: 'clock_out',
  MANAGE_STAFF: 'manage_staff',
  VIEW_HR: 'view_hr',
});

const C = CAPABILITIES;

/**
 * Role → capability grants with scope qualifiers:
 *   'assigned'  only assigned residents/houses, only during an active shift
 *   'house'     any resident in an assigned house
 *   'org'       organization-wide
 *   'window'    only inside an approved access window (externals/auditors)
 */
export const ROLE_GRANTS = Object.freeze({
  [ROLES.DSP]: {
    [C.VIEW_RESIDENT]: 'assigned', [C.CREATE_DOCUMENTATION]: 'assigned',
    [C.VIEW_DOCUMENT]: 'assigned', [C.VIEW_ATTACHMENT]: 'assigned',
    [C.CLOCK_IN]: 'assigned', [C.CLOCK_OUT]: 'assigned', [C.USE_BREAK_GLASS]: 'house',
  },
  [ROLES.TEAM_LEAD]: {
    [C.VIEW_RESIDENT]: 'house', [C.EDIT_RESIDENT]: 'house',
    [C.CREATE_DOCUMENTATION]: 'house', [C.REVIEW_DOCUMENTATION]: 'house',
    [C.VIEW_DOCUMENT]: 'house', [C.VIEW_ATTACHMENT]: 'house',
    [C.CLOCK_IN]: 'house', [C.CLOCK_OUT]: 'house', [C.USE_BREAK_GLASS]: 'house',
    [C.VIEW_AUDIT_LOG]: 'house', [C.VIEW_COMPLIANCE]: 'house',
  },
  [ROLES.NURSE]: {
    [C.VIEW_RESIDENT]: 'org', [C.EDIT_RESIDENT]: 'org',
    [C.REVIEW_DOCUMENTATION]: 'org', [C.VIEW_DOCUMENT]: 'org',
    [C.VIEW_ATTACHMENT]: 'org', [C.USE_BREAK_GLASS]: 'org',
  },
  [ROLES.CARE_COORDINATOR]: {
    [C.VIEW_RESIDENT]: 'org', [C.EDIT_RESIDENT]: 'org',
    [C.VIEW_DOCUMENT]: 'org', [C.VIEW_ATTACHMENT]: 'org',
    [C.CREATE_DOCUMENTATION]: 'org',
  },
  [ROLES.HR_TRAINING]: {
    [C.MANAGE_STAFF]: 'org', [C.VIEW_HR]: 'org',
  },
  [ROLES.BILLING_ADMIN]: {
    [C.VIEW_RESIDENT]: 'org', [C.VIEW_DOCUMENT]: 'org', [C.VIEW_BILLING]: 'org',
    [C.VIEW_COMPLIANCE]: 'org', [C.VIEW_AUDIT_LOG]: 'org',
  },
  [ROLES.AUDITOR]: {
    [C.VIEW_DOCUMENT]: 'window', [C.VIEW_AUDIT_LOG]: 'window',
    [C.EXPORT_AUDIT_PACKET]: 'window', [C.VIEW_COMPLIANCE]: 'window',
  },
  [ROLES.OWNER]: {
    [C.VIEW_RESIDENT]: 'org', [C.VIEW_DOCUMENT]: 'org', [C.VIEW_BILLING]: 'org',
    [C.VIEW_COMPLIANCE]: 'org', [C.VIEW_AUDIT_LOG]: 'org',
    [C.EXPORT_AUDIT_PACKET]: 'org', [C.MANAGE_STAFF]: 'org', [C.VIEW_HR]: 'org',
  },
  [ROLES.EXTERNAL_SC]: { [C.VIEW_RESIDENT]: 'window', [C.VIEW_DOCUMENT]: 'window' },
  [ROLES.DRIVER]: { [C.VIEW_RESIDENT]: 'assigned', [C.CREATE_DOCUMENTATION]: 'assigned' },
});

/** Highest resident field tier each role may receive (field-level filtering). */
export const ROLE_FIELD_TIER = Object.freeze({
  [ROLES.DSP]: FIELD_TIERS.CLINICAL,        // needs allergies/meds for safe care
  [ROLES.TEAM_LEAD]: FIELD_TIERS.CLINICAL,
  [ROLES.NURSE]: FIELD_TIERS.CLINICAL,
  [ROLES.CARE_COORDINATOR]: FIELD_TIERS.ADMIN,
  [ROLES.HR_TRAINING]: FIELD_TIERS.BASIC,
  [ROLES.BILLING_ADMIN]: FIELD_TIERS.ADMIN,
  [ROLES.AUDITOR]: FIELD_TIERS.ADMIN,
  [ROLES.OWNER]: FIELD_TIERS.ADMIN,
  [ROLES.EXTERNAL_SC]: FIELD_TIERS.CARE,
  [ROLES.DRIVER]: FIELD_TIERS.BASIC,        // drivers never receive medical detail
});
