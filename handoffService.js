// Builds the guided handoff draft by auto-filling sections from the shift's
// completed documentation. The DSP reviews and confirms — never retypes.
import { HANDOFF_SECTIONS, createHandoff, missingHandoffSections } from '../models/handoff.model.js';
import { DOC_TYPES } from '../models/documentation.model.js';

function joinLines(lines, fallback) {
  return lines.length ? lines.join('\n') : fallback;
}

function autoFillSection(key, { documents, incidents, appointments, residents }) {
  const byType = (t) => documents.filter((d) => d.type === t && d.signature);
  switch (key) {
    case 'residentDay':
      return joinLines(residents.map((r) => `${r.preferredName}: day logged as ${r.dayStatus.replaceAll('_', ' ')}.`), '');
    case 'meals':
      return joinLines(byType(DOC_TYPES.MEAL_LOG).map((d) => d.title + ' — ' + d.body), 'No meal logs signed yet.');
    case 'incidents':
      return joinLines(incidents.map((i) => `${i.summary} (${i.status.replaceAll('_', ' ')})`), 'No incidents this shift.');
    case 'money':
      return joinLines(documents.filter((d) => d.type === DOC_TYPES.RECEIPT).map((d) => d.title), 'No money used.');
    case 'appointments':
      return joinLines(appointments.map((a) => `${a.time} — ${a.label}`), 'Nothing scheduled.');
    default:
      return '';
  }
}

/** Create a draft with auto-filled sections marked for review. */
export function buildHandoffDraft({ shift, documents, incidents, appointments, residents }, actorId) {
  const handoff = createHandoff(
    { shiftId: shift.id, houseId: shift.houseId, residentIds: shift.residentIds },
    actorId,
  );
  for (const section of HANDOFF_SECTIONS) {
    const text = autoFillSection(section.key, { documents, incidents, appointments, residents });
    handoff.sections[section.key] = { text, autoFilled: !!text, confirmed: false };
  }
  return handoff;
}

/** Validate before sending. Every required section must be confirmed. */
export function validateHandoff(handoff, houseConfig) {
  const missing = missingHandoffSections(handoff, houseConfig);
  return {
    ok: missing.length === 0,
    missingSections: missing.map((s) => ({ key: s.key, label: s.label })),
  };
}

export function sendHandoff(handoff, houseConfig, now = new Date()) {
  const check = validateHandoff(handoff, houseConfig);
  if (!check.ok) return { ok: false, ...check };
  handoff.status = 'sent';
  handoff.sentAt = now.toISOString();
  return { ok: true, handoff };
}
