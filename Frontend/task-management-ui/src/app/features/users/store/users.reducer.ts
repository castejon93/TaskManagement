import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { User } from '../../../core/models/user';
import * as UsersActions from './users.actions';

/**
 * EntityAdapter manages a normalized map of { ids: [], entities: {} }.
 * This avoids duplicate users and enables O(1) lookups by id.
 * The same slice is shared between /tasks and /users routes — both register it
 * so the task-form assignee dropdown is always populated.
 */
export interface UsersState extends EntityState<User> {
  /** True while GET /api/users is in flight; drives the users table progress bar. */
  loading: boolean;
  /** Populated on failure; the global toast already handles user-facing messaging. */
  error: string | null;
}

const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const initialState: UsersState = adapter.getInitialState({
  loading: false,
  error: null,
});

export const usersReducer = createReducer(
  initialState,

  // Clear stale errors so a retry doesn't show an old error message.
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // setAll replaces the entire collection — correct for a full reload.
  on(UsersActions.loadUsersSuccess, (state, { users }) =>
    adapter.setAll(users, { ...state, loading: false }),
  ),

  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // addOne appends the newly created user returned by the API without re-fetching the full list.
  on(UsersActions.createUserSuccess, (state, { user }) => adapter.addOne(user, state)),
);

/** Re-exported so selectors can compose without coupling to the adapter instance. */
export const { selectAll } = adapter.getSelectors();
