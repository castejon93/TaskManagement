import { createAction, props } from '@ngrx/store';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  TaskFilters,
} from '../../../core/models/task';

// ─── Load Tasks ──────────────────────────────────────────────────────────────
// Dispatched by TaskListComponent whenever the status filter changes.
// filters.statusId === null means "show all statuses".
export const loadTasks = createAction('[Tasks] Load Tasks', props<{ filters: TaskFilters }>());

/** Reducer replaces all tasks in the entity store with the fresh API response. */
export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[] }>(),
);

/** Error message is stored on state.error for optional display; the interceptor already showed a toast. */
export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>(),
);

// ─── Create Task ──────────────────────────────────────────────────────────────
// Dispatched by TaskFormComponent on valid form submit.
export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ request: CreateTaskRequest }>(),
);

/** Reducer inserts the new task returned by the API into the entity store. */
export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: Task }>(),
);

export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>(),
);

// ─── Update Task Status ───────────────────────────────────────────────────────
// Dispatched when the user clicks the "Advance" button on a task row.
// newStatusId = currentStatusId + 1 — the API validates the transition is legal.
export const updateTaskStatus = createAction(
  '[Tasks] Update Status',
  props<{ id: number; request: UpdateTaskStatusRequest }>(),
);

/** Reducer uses upsertOne so the row updates in place without a full reload. */
export const updateTaskStatusSuccess = createAction(
  '[Tasks] Update Status Success',
  props<{ task: Task }>(),
);

export const updateTaskStatusFailure = createAction(
  '[Tasks] Update Status Failure',
  props<{ error: string }>(),
);
