// Mirrors TaskResponse DTO from the .NET API
export interface Task {
  id: number;
  title: string;
  description: string | null;
  statusId: number;
  /** Human-readable status label (e.g. 'Pending', 'In Progress', 'Done'). */
  statusName: string;
  userId: number;
  /** Resolved display name of the assigned user. */
  userName: string;
  /** JSON-serialized TaskMetadata blob; null when no custom fields are set. */
  additionalInfo: string | null;
  /** ISO-8601 timestamp returned by the API (stored as string to avoid timezone loss). */
  createdAt: string;
  updatedAt: string | null;
}

/** Payload sent to POST /api/tasks when creating a new task. */
export interface CreateTaskRequest {
  title: string;
  description: string | null;
  /** Id of the user the task is assigned to. */
  userId: number;
  /** JSON-serialized metadata blob; pass null when there are no custom fields. */
  additionalInfo: string | null;
}

/** Payload sent to PUT /api/tasks/{id}/status to advance a task to the next status. */
export interface UpdateTaskStatusRequest {
  newStatusId: number;
}

/** Values used to filter the task list; null means "no filter applied" for that field. */
export interface TaskFilters {
  userId: number | null;
  statusId: number | null;
}
