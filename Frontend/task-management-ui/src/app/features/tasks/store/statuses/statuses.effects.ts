import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StatusesApiService } from '../../../../core/api/statuses-api';
import * as StatusesActions from './statuses.actions';

@Injectable()
export class StatusesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(StatusesApiService);

  loadStatuses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatusesActions.loadStatuses),
      switchMap(() =>
        this.api.getAll().pipe(
          map((statuses) => StatusesActions.loadStatusesSuccess({ statuses })),
          catchError((err) => of(StatusesActions.loadStatusesFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
