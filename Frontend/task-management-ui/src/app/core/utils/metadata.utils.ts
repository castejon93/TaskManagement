import { TaskMetadata } from '../models/task-metadata';

const EMPTY: TaskMetadata = { customFields: {} };

export function parseMetadata(json: string | null | undefined): TaskMetadata {
  if (!json) return { customFields: {} };
  try {
    return { ...EMPTY, ...JSON.parse(json) } as TaskMetadata;
  } catch {
    return { customFields: {} };
  }
}

export function serializeMetadata(meta: Partial<TaskMetadata>): string | null {
  const clean: Partial<TaskMetadata> = {};
  if (Object.keys(meta.customFields ?? {}).length) clean.customFields = meta.customFields;
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
}
