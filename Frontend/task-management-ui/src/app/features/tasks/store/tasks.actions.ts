import { createAction, props } from '@ngrx/store';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  TaskFilters,
} from '../../../core/models/task';

export const loadTasks = createAction('[Tasks] Load Tasks', props<{ filters: TaskFilters }>());

export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[] }>(),
);
export const loadTasksFailure = createAction(
  '[Tasks] Load Tasks Failure',
  props<{ error: string }>(),
);

export const createTask = createAction(
  '[Tasks] Create Task',
  props<{ request: CreateTaskRequest }>(),
);

export const createTaskSuccess = createAction(
  '[Tasks] Create Task Success',
  props<{ task: Task }>(),
);

export const createTaskFailure = createAction(
  '[Tasks] Create Task Failure',
  props<{ error: string }>(),
);

export const updateTaskStatus = createAction(
  '[Tasks] Update Status',
  props<{ id: number; request: UpdateTaskStatusRequest }>(),
);

export const updateTaskStatusSuccess = createAction(
  '[Tasks] Update Status Success',
  props<{ task: Task }>(),
);

export const updateTaskStatusFailure = createAction(
  '[Tasks] Update Status Failure',
  props<{ error: string }>(),
);
