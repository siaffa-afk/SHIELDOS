// Clock-out final review: what's done, what's not, and what happens to
// anything unfinished (routed to the supervisor — never silently dropped).
import { deriveChecklist } from './checklistService.js';
import { deriveMissingItems } from './missingItemsService.js';

/**
 * @returns {{ready: boolean, headline: string, lines: Array, routed: Array}}
 * headline uses plain DSP language; role views re-word via roleService.
 */
export function reviewClockOut(input) {
  const { facts } = deriveChecklist(input);
  const missing = deriveMissingItems(input);
  const lines = [
    { key: 'notes', ok: facts.notes.length === 0,
      label: facts.notes.length === 0 ? 'Your notes are saved' : `${facts.notes.length} note(s) need attention` },
    { key: 'handoff', ok: facts.handoffSent,
      label: facts.handoffSent ? 'Handoff sent' : 'Your handoff has not been sent yet' },
    { key: 'missing', ok: missing.length === 0,
      label: missing.length === 0 ? 'Nothing is missing' : `${missing.length} item(s) still open` },
  ];
  const blockers = lines.filter((l) => !l.ok);
  return {
    ready: blockers.length === 0,
    headline: headlineFor(blockers),
    lines,
    // Anything still open at clock-out gets routed, with the user informed.
    routed: missing.map((m) => ({ ...m, routedTo: 'supervisor' })),
  };
}

function headlineFor(blockers) {
  if (blockers.length === 0) return 'Ready to clock out';
  if (blockers.length === 1) return 'One thing needs attention first';
  const words = ['Two', 'Three', 'Four', 'Five'];
  return `${words[blockers.length - 2] ?? blockers.length} things need attention first`;
}

export const CLOCK_OUT_COMPLETE_MESSAGE =
  'Clocked out. Your notes are saved. Handoff was sent. '
  + 'Anything unfinished was sent to your supervisor.';

/**
 * Perform clock-out. `force` routes open missing items to the supervisor,
 * but the handoff is a hard gate — the next shift must be covered.
 */
export function performClockOut(input, { force = false } = {}, now = new Date()) {
  const review = reviewClockOut(input);
  const handoffSent = review.lines.find((l) => l.key === 'handoff')?.ok;
  if (!handoffSent) return { ok: false, review, hardBlock: 'handoff_not_sent' };
  if (!review.ready && !force) {
    return { ok: false, review };
  }
  return {
    ok: true,
    review,
    clockOutAt: now.toISOString(),
    routedToSupervisor: review.routed,
    message: CLOCK_OUT_COMPLETE_MESSAGE,
  };
}
