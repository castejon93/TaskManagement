import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { TasksApiService } from '../../../core/api/tasks-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as TasksActions from './tasks.actions';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TasksApiService);
  private readonly notify = inject(NotificationService);

  // concatMap queues requests — no HTTP cancellations are sent to the API.
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      concatMap(({ filters }) =>
        this.api.getAll(filters).pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((err) => of(TasksActions.loadTasksFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // exhaustMap ignores duplicate dispatches while a request is in flight — prevents double-submit.
  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      exhaustMap(({ request }) =>
        this.api.create(request).pipe(
          map((task) => {
            this.notify.success(`Task "${task.title}" created.`);
            return TasksActions.createTaskSuccess({ task });
          }),
          catchError((err) => of(TasksActions.createTaskFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // exhaustMap prevents a second status update from firing while the first is still pending.
  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTaskStatus),
      exhaustMap(({ id, request }) =>
        this.api.updateStatus(id, request).pipe(
          map((task) => {
            this.notify.success(`Task status updated to "${task.statusName}".`);
            return TasksActions.updateTaskStatusSuccess({ task });
          }),
          catchError((err) => of(TasksActions.updateTaskStatusFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
