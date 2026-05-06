import { createAction, props } from '@ngrx/store';
import { User, CreateUserRequest } from '../../../core/models/user';

// ─── Load Users ──────────────────────────────────────────────────────────────
// Dispatched on UsersComponent init AND by TasksComponent so that the task-form
// assignee dropdown is populated even when navigating directly to /tasks/new.
export const loadUsers = createAction('[Users] Load Users');

/** Reducer replaces all users in the entity store with the fresh API response. */
export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: User[] }>(),
);

/** Error message stored on state.error; global toast already shown by the interceptor. */
export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>(),
);

// ─── Create User ──────────────────────────────────────────────────────────────
// Dispatched by UserFormComponent on valid form submit.
export const createUser = createAction(
  '[Users] Create User',
  props<{ request: CreateUserRequest }>(),
);

/** Reducer inserts the new user returned by the API without a full reload. */
export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: User }>(),
);

export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: string }>(),
);
