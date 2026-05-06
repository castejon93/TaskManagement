import { TaskMetadata } from '../models/task-metadata';

/** Fallback value used when the stored JSON is missing or malformed. */
const EMPTY: TaskMetadata = { customFields: {} };

/**
 * Safely deserializes the `additionalInfo` JSON column into a typed TaskMetadata object.
 * Returns an empty metadata object on null, empty string, or invalid JSON to avoid
 * crashing the template when legacy tasks have no metadata stored.
 */
export function parseMetadata(json: string | null | undefined): TaskMetadata {
  if (!json) return { customFields: {} };
  try {
    // Spread EMPTY first so any future fields added to TaskMetadata get a safe default.
    return { ...EMPTY, ...JSON.parse(json) } as TaskMetadata;
  } catch {
    return { customFields: {} };
  }
}

/**
 * Serializes a partial TaskMetadata object to a JSON string for storage in `additionalInfo`.
 * Returns null when there is nothing meaningful to store so the API column stays null.
 * Omits empty customFields maps to keep the stored JSON compact.
 */
export function serializeMetadata(meta: Partial<TaskMetadata>): string | null {
  const clean: Partial<TaskMetadata> = {};
  if (Object.keys(meta.customFields ?? {}).length) clean.customFields = meta.customFields;
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
}
