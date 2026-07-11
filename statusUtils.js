// Status → color/label mapping. Color directs attention, never decorates:
// red only for true blockers/safety; text always accompanies color (WCAG).
export const STATUS_META = Object.freeze({
  done:     { tone: 'green', label: 'Done',       icon: '✓' },
  current:  { tone: 'blue',  label: 'Now',        icon: '→' },
  upcoming: { tone: 'gray',  label: 'Later',      icon: '·' },
  blocked:  { tone: 'amber', label: 'Waiting on something', icon: '!' },
  urgent:   { tone: 'red',   label: 'Urgent',     icon: '!' },
});

export function statusMeta(status) {
  return STATUS_META[status] ?? STATUS_META.upcoming;
}

export const DAY_STATUS_LABEL = Object.freeze({
  stable: 'Doing well',
  needs_follow_up: 'Needs a follow-up',
  elevated: 'Extra attention today',
  urgent: 'Urgent — see alerts',
});

export const DAY_STATUS_TONE = Object.freeze({
  stable: 'green', needs_follow_up: 'blue', elevated: 'amber', urgent: 'red',
});

export function dayStatus(resident) {
  return {
    label: DAY_STATUS_LABEL[resident.dayStatus] ?? resident.dayStatus,
    tone: DAY_STATUS_TONE[resident.dayStatus] ?? 'gray',
  };
}
