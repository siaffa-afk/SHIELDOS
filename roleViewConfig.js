// Config-driven role views: one guided-queue engine, configured per role
// ("build one dashboard, configured N ways" — docs/09). Each config states
// the mission, which queues to show, and the queue's plain intro line.
// Queue data itself always comes from the permission-checked API.
import { ROLES } from '../models/user.model.js';

export const ROLE_VIEW_CONFIG = Object.freeze({
  [ROLES.TEAM_LEAD]: {
    mission: 'Review, correct, and keep the shift covered.',
    queues: [
      { key: 'review', title: 'Needs your review', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Documentation and incidents waiting on you. Oldest first.' },
      { key: 'compliance', title: 'Team readiness', endpoint: 'GET_COMPLIANCE_QUEUE',
        intro: 'Training and tracking items that affect who can work.' },
    ],
  },
  [ROLES.NURSE]: {
    mission: 'Clinical review and health follow-up.',
    queues: [
      { key: 'review', title: 'Clinical review queue', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Incidents and health documentation needing clinical eyes.' },
    ],
  },
  [ROLES.CARE_COORDINATOR]: {
    mission: 'Appointments, follow-ups, and paperwork closed out.',
    queues: [
      { key: 'review', title: 'Follow-ups to close', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Appointment outcomes and documents to finish.' },
    ],
  },
  [ROLES.HR_TRAINING]: {
    mission: 'Everyone scheduled is trained, cleared, and eligible.',
    queues: [
      { key: 'compliance', title: 'Staff readiness', endpoint: 'GET_COMPLIANCE_QUEUE',
        intro: 'Credentials and trainings to renew before they block scheduling.' },
    ],
  },
  [ROLES.BILLING_ADMIN]: {
    mission: 'Clear documentation holds so services can bill cleanly.',
    queues: [
      { key: 'billing', title: 'Billing readiness', endpoint: 'GET_BILLING_QUEUE',
        intro: 'Service lines on hold until documentation is complete and reviewed.' },
      { key: 'review', title: 'Documentation review status', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Where each hold comes from.' },
    ],
  },
  [ROLES.AUDITOR]: {
    mission: 'Verify proof inside your approved scope.',
    queues: [
      { key: 'review', title: 'Proof gaps in scope', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Records in your approved packet with missing or unsigned proof.' },
    ],
    canExport: true,
  },
  [ROLES.OWNER]: {
    mission: 'Risk, readiness, and decisions — not individual tasks.',
    queues: [
      { key: 'billing', title: 'Billing readiness', endpoint: 'GET_BILLING_QUEUE',
        intro: 'What is on hold and why.' },
      { key: 'compliance', title: 'Compliance gaps', endpoint: 'GET_COMPLIANCE_QUEUE',
        intro: 'Staff eligibility and tracking gaps that carry risk.' },
      { key: 'review', title: 'Open reviews', endpoint: 'GET_REVIEW_QUEUE',
        intro: 'Documentation and incident reviews still open.' },
    ],
  },
});
