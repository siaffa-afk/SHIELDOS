// Input validation used at the API boundary. Every write handler validates
// before it touches the db — mirrors server-side zod/schema validation.
const MAX_TEXT = 4000;
const MAX_TITLE = 140;

export function cleanText(value, { max = MAX_TEXT, required = false, label = 'This field' } = {}) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (required && !text) return { ok: false, message: `${label} is required.` };
  if (text.length > max) return { ok: false, message: `${label} is too long (max ${max}).` };
  return { ok: true, value: text };
}

export function cleanTitle(value, opts = {}) {
  return cleanText(value, { max: MAX_TITLE, required: true, label: 'Title', ...opts });
}

export function cleanAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 100000) {
    return { ok: false, message: 'Enter a valid amount.' };
  }
  return { ok: true, value: Math.round(num * 100) / 100 };
}

export function cleanId(value, prefix) {
  const ok = typeof value === 'string' && /^[a-z0-9_]{1,40}$/i.test(value)
    && (!prefix || value.startsWith(prefix));
  return ok ? { ok: true, value } : { ok: false, message: 'Invalid reference.' };
}

/** Validate a set of fields at once; returns first failure per key. */
export function validateAll(checks) {
  const problems = Object.entries(checks)
    .filter(([, result]) => !result.ok)
    .map(([key, result]) => ({ key, message: result.message }));
  return { ok: problems.length === 0, problems };
}
