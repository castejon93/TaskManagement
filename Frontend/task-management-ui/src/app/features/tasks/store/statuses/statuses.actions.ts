import { createAction, props } from '@ngrx/store';
import { TaskStatus } from '../../../../core/models/task-status';

export const loadStatuses = createAction('[Statuses] Load Statuses');

export const loadStatusesSuccess = createAction(
  '[Statuses] Load Statuses Success',
  props<{ statuses: TaskStatus[] }>(),
);

export const loadStatusesFailure = createAction(
  '[Statuses] Load Statuses Failure',
  props<{ error: string }>(),
);
