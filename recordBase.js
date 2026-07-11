// Base shape shared by every persisted record (see docs/DATA_MODEL.md and
// fable-build/docs/02-data-model.md). Every record carries who/when metadata,
// soft-delete fields, and an access scope so "minimum necessary" can be
// enforced per record, not just per role.

let seq = 1000;

/** Generate a prefixed, collision-safe mock id. Backend replaces with UUIDs. */
export function newId(prefix) {
  seq += 1;
  return `${prefix}_${seq.toString(36)}`;
}

/**
 * @typedef {Object} RecordMeta
 * @property {string} id
 * @property {string} createdAt   ISO — server-generated in production
 * @property {string} updatedAt
 * @property {string} createdBy   userId
 * @property {string} updatedBy   userId
 * @property {?string} deletedAt  soft delete only; nothing hard-deletes client-side
 * @property {?string} deletedBy
 * @property {?string} deleteReason  required when deletedAt is set
 * @property {{houseId: ?string, residentId: ?string, roles: string[]}} accessScope
 */

/** Stamp a new record with metadata. `now` is injectable for tests. */
export function withRecordMeta(prefix, fields, userId, scope = {}, now = new Date()) {
  const ts = now.toISOString();
  return {
    id: newId(prefix),
    ...fields,
    createdAt: ts,
    updatedAt: ts,
    createdBy: userId,
    updatedBy: userId,
    deletedAt: null,
    deletedBy: null,
    deleteReason: null,
    accessScope: {
      houseId: scope.houseId ?? null,
      residentId: scope.residentId ?? null,
      roles: scope.roles ?? [],
    },
  };
}

/** Mark a record updated. Mutates a copy; originals are never overwritten. */
export function touch(record, userId, changes, now = new Date()) {
  return { ...record, ...changes, updatedAt: now.toISOString(), updatedBy: userId };
}

/** Soft delete. A reason is mandatory — deletions route to team-lead review. */
export function softDelete(record, userId, reason, now = new Date()) {
  if (!reason) throw new Error('deleteReason is required');
  return touch(record, userId, {
    deletedAt: now.toISOString(),
    deletedBy: userId,
    deleteReason: reason,
  });
}

export function isActive(record) {
  return !record.deletedAt;
}
