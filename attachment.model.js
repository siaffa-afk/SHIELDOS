// Attachments never expose storage paths. Clients receive short-lived signed
// URLs from the backend (integrations/storageService); downloads are logged.
import { withRecordMeta } from './recordBase.js';

export const ATTACHMENT_CATEGORIES = Object.freeze([
  'receipt', 'medical_document', 'incident_photo', 'signature_page',
  'training_certificate', 'general',
]);

/** Allowlist enforced at upload time — anything else is rejected. */
export const ALLOWED_FILE_TYPES = Object.freeze([
  'image/jpeg', 'image/png', 'image/heic', 'application/pdf',
]);
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

/**
 * @typedef {Object} Attachment
 * @property {string} fileName
 * @property {string} mimeType
 * @property {number} sizeBytes
 * @property {string} category      one of ATTACHMENT_CATEGORIES
 * @property {?string} residentId
 * @property {?string} documentId   the record this file supports
 * @property {number} version
 * @property {'pending_scan'|'clean'|'quarantined'} scanStatus  malware-scan placeholder
 */

export function createAttachment(fields, actorId) {
  return withRecordMeta('att', {
    fileName: fields.fileName,
    mimeType: fields.mimeType,
    sizeBytes: fields.sizeBytes,
    category: fields.category ?? 'general',
    residentId: fields.residentId ?? null,
    houseId: fields.houseId ?? null,
    documentId: fields.documentId ?? null,
    version: fields.version ?? 1,
    scanStatus: 'pending_scan',
    storageKey: `private/${fields.category ?? 'general'}/${fields.fileName}`, // never a public URL
  }, actorId, { houseId: fields.houseId ?? null, residentId: fields.residentId ?? null });
}

export function validateUpload({ mimeType, sizeBytes }) {
  const problems = [];
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) problems.push('file_type_not_allowed');
  if (sizeBytes > MAX_FILE_BYTES) problems.push('file_too_large');
  return { ok: problems.length === 0, problems };
}
