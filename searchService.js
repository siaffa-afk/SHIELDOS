// Permission-aware command search. Candidates are generated server-side and
// each one is authorized before it can appear — unauthorized records don't
// exist as far as the caller can tell (no existence leaks).
import { authorize } from '../security/accessControl.js';
import { CAPABILITIES } from '../models/permission.model.js';

/** Actions searchable by name; each declares the capability it needs. */
export const SEARCH_ACTIONS = Object.freeze([
  { id: 'act_handoff', label: 'Send Handoff', keywords: 'handoff shift change', capability: CAPABILITIES.CREATE_DOCUMENTATION, nav: 'checklist:send_handoff' },
  { id: 'act_clockout', label: 'Clock Out', keywords: 'clock out end shift leave', capability: CAPABILITIES.CLOCK_OUT, nav: 'checklist:clock_out' },
  { id: 'act_emergency', label: 'Emergency', keywords: 'emergency help 911 urgent', capability: null, nav: 'emergency' },
  { id: 'act_incident', label: 'Start Incident Report', keywords: 'incident report accident fall', capability: CAPABILITIES.CREATE_DOCUMENTATION, nav: 'document:incident' },
  { id: 'act_receipt', label: 'Add Receipt', keywords: 'receipt money spend purchase', capability: CAPABILITIES.CREATE_DOCUMENTATION, nav: 'document:receipt' },
  { id: 'act_supplies', label: 'Request Supplies', keywords: 'supplies order groceries', capability: CAPABILITIES.CREATE_DOCUMENTATION, nav: 'document:supplies' },
  { id: 'act_appts', label: 'Appointments Today', keywords: 'appointments outings schedule calendar', capability: CAPABILITIES.VIEW_RESIDENT, nav: 'calendar' },
  { id: 'act_billing', label: 'Billing Readiness', keywords: 'billing holds claims revenue', capability: CAPABILITIES.VIEW_BILLING, nav: 'queues:billing' },
  { id: 'act_audit', label: 'Audit Log', keywords: 'audit log history compliance', capability: CAPABILITIES.VIEW_AUDIT_LOG, nav: 'audit' },
  { id: 'act_export', label: 'Export Audit Packet', keywords: 'export packet auditor proof', capability: CAPABILITIES.EXPORT_AUDIT_PACKET, nav: 'audit:export' },
]);

function matches(query, ...texts) {
  const q = query.toLowerCase().trim();
  return q.length > 0 && texts.some((t) => t && t.toLowerCase().includes(q));
}

function residentResults(query, user, ctx, residents) {
  return residents
    .filter((r) => matches(query, r.name, r.preferredName))
    .filter((r) => authorize(user, CAPABILITIES.VIEW_RESIDENT, r, ctx).allowed)
    .map((r) => ({ kind: 'resident', id: r.id, label: r.name, nav: `resident:${r.id}` }));
}

function taskResults(query, user, ctx, tasks) {
  return tasks
    .filter((t) => matches(query, t.label))
    .filter((t) => authorize(user, CAPABILITIES.VIEW_RESIDENT, t, ctx).allowed)
    .map((t) => ({ kind: 'task', id: t.id, label: t.label, nav: 'checklist:support_residents' }));
}

function docResults(query, user, ctx, documents) {
  return documents
    .filter((d) => matches(query, d.title, d.body))
    .filter((d) => authorize(user, CAPABILITIES.VIEW_DOCUMENT, d, ctx).allowed)
    .map((d) => ({ kind: 'document', id: d.id, label: d.title, nav: `document:${d.id}` }));
}

function actionResults(query, user, ctx) {
  return SEARCH_ACTIONS
    .filter((a) => matches(query, a.label, a.keywords))
    .filter((a) => !a.capability || authorize(user, a.capability, null, ctx).allowed)
    .map((a) => ({ kind: 'action', id: a.id, label: a.label, nav: a.nav }));
}

/** @returns permission-filtered results, actions first, capped at 12. */
export function runSearch(query, user, ctx, { residents, tasks, documents }) {
  if (!query || query.trim().length < 2) return [];
  return [
    ...actionResults(query, user, ctx),
    ...residentResults(query, user, ctx, residents),
    ...taskResults(query, user, ctx, tasks),
    ...docResults(query, user, ctx, documents),
  ].slice(0, 12);
}
