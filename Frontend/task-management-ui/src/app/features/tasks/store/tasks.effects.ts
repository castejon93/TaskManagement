import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TasksApiService } from '../../../core/api/tasks-api';
import { NotificationService } from '../../../core/services/notification';
import * as TasksActions from './tasks.actions';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TasksApiService);
  private readonly notify = inject(NotificationService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      // switchMap cancels in-flight HTTP calls when new filters arrive quickly.
      // This is critical for the filter+debounce pattern in the task list.
      switchMap(({ filters }) =>
        this.api.getAll(filters).pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((err) => of(TasksActions.loadTasksFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      switchMap(({ request }) =>
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

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTaskStatus),
      switchMap(({ id, request }) =>
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
