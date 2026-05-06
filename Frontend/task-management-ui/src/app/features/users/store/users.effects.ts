import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsersApiService } from '../../../core/api/users-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import * as UsersActions from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(UsersApiService);
  private readonly notify = inject(NotificationService);

  // concatMap queues requests — no HTTP cancellations are sent to the API.
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      concatMap(() =>
        this.api.getAll().pipe(
          map((users) => UsersActions.loadUsersSuccess({ users })),
          catchError((err) => of(UsersActions.loadUsersFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // exhaustMap ignores duplicate dispatches while a request is in flight — prevents double-submit.
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      exhaustMap(({ request }) =>
        this.api.create(request).pipe(
          map((user) => {
            this.notify.success(`User "${user.name}" created successfully.`);
            return UsersActions.createUserSuccess({ user });
          }),
          catchError((err) => of(UsersActions.createUserFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
