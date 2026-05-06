/**
 * Structured representation of the `additionalInfo` JSON column stored on a task.
 * Serialized via serializeMetadata() before sending to the API and deserialized
 * via parseMetadata() when reading from the API response.
 */
export interface TaskMetadata {
  /** Arbitrary key-value pairs entered by the user in the task-form custom fields panel. */
  customFields: Record<string, string>;
}
