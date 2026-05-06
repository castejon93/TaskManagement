import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { TaskStatus } from '../../../../core/models/task-status';
import * as StatusesActions from './statuses.actions';

export interface StatusesState extends EntityState<TaskStatus> {
  loading: boolean;
  error: string | null;
}

const adapter: EntityAdapter<TaskStatus> = createEntityAdapter<TaskStatus>({
  sortComparer: (a, b) => a.sortOrder - b.sortOrder,
});

const initialState: StatusesState = adapter.getInitialState({
  loading: false,
  error: null,
});

export const statusesReducer = createReducer(
  initialState,

  on(StatusesActions.loadStatuses, (state) => ({ ...state, loading: true, error: null })),

  on(StatusesActions.loadStatusesSuccess, (state, { statuses }) =>
    adapter.setAll(statuses, { ...state, loading: false }),
  ),

  on(StatusesActions.loadStatusesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);

export const { selectAll } = adapter.getSelectors();
