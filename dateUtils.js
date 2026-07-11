// One date module — the old prototypes had 5+ competing formatters.
const TIME_FMT = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const FULL_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
});

export function fmtTime(isoOrDate) {
  return TIME_FMT.format(new Date(isoOrDate));
}

export function fmtDate(isoOrDate) {
  return DATE_FMT.format(new Date(isoOrDate));
}

export function fmtDayLong(isoOrDate = new Date()) {
  return FULL_FMT.format(new Date(isoOrDate));
}

export function minutesBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 60000);
}

/** "3:40 PM – 11:00 PM" for a shift window. */
export function fmtShiftWindow(shift) {
  return `${fmtTime(shift.startsAt)} – ${fmtTime(shift.endsAt)}`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
