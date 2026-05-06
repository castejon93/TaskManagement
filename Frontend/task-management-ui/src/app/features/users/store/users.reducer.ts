import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { User } from '../../../core/models/user';
import * as UsersActions from './users.actions';

// EntityAdapter manages a normalized map of { ids: [], entities: {} }
// This avoids duplicate users and enables O(1) lookups by id.
export interface UsersState extends EntityState<User> {
  loading: boolean;
  error: string | null;
}

const adapter: EntityAdapter<User> = createEntityAdapter<User>();

const initialState: UsersState = adapter.getInitialState({
  loading: false,
  error: null
});

export const usersReducer = createReducer(
  initialState,

  on(UsersActions.loadUsers, state => ({
    ...state, loading: true, error: null
  })),

  on(UsersActions.loadUsersSuccess, (state, { users }) =>
    adapter.setAll(users, { ...state, loading: false })
  ),

  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  on(UsersActions.createUserSuccess, (state, { user }) =>
    adapter.addOne(user, state)   // Adds to normalized entity map
  )
);

// Export entity selectors (selectAll, selectIds, selectEntities, selectTotal)
export const { selectAll, selectEntities } = adapter.getSelectors();