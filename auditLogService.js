// Append-only, hash-chained audit log (SHA-256 — replaces the old prototype's
// djb2, which was not tamper-evident). The log array is module-private:
// callers can append and read, never edit or delete.
import { buildAuditEvent } from '../models/auditLog.model.js';

const events = [];
let seq = 0;
let chain = Promise.resolve('genesis');

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Append an event. Serialized through a promise chain so hashes never race. */
export function logAudit(fields) {
  chain = chain.then(async (prevHash) => {
    seq += 1;
    const event = buildAuditEvent(fields, prevHash, seq);
    event.hash = await sha256(prevHash + JSON.stringify({ ...event, hash: '' }));
    events.push(Object.freeze(event));
    return event.hash;
  });
  return chain;
}

/** Read-only copy, newest first. Access is authorized by the API layer. */
export function readAudit({ limit = 100 } = {}) {
  return events.slice(-limit).reverse();
}

/** Verify the whole chain; a single edited event breaks every later hash. */
export async function verifyChain() {
  let prev = 'genesis';
  for (const e of events) {
    const expected = await sha256(prev + JSON.stringify({ ...e, hash: '' }));
    if (expected !== e.hash) return { ok: false, brokenAt: e.id };
    prev = e.hash;
  }
  return { ok: true, count: events.length };
}

export function auditCount() {
  return events.length;
}
