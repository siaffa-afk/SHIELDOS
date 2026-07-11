// Text helpers. React escapes output by design (no innerHTML anywhere in this
// app — the old prototype's XSS surface is gone), so these are formatting
// helpers, not sanitizers.
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function titleCase(text) {
  return text.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function firstName(fullName) {
  return (fullName ?? '').split(' ')[0];
}

export function truncate(text, max = 120) {
  if (!text || text.length <= max) return text ?? '';
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Initials for avatars — never renders raw user HTML. */
export function initials(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
