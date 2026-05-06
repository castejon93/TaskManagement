import { createAction, props } from '@ngrx/store';
import { User, CreateUserRequest } from '../../../core/models/user';

export const loadUsers = createAction('[Users] Load Users');

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: User[] }>(),
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>(),
);

export const createUser = createAction(
  '[Users] Create User',
  props<{ request: CreateUserRequest }>(),
);

export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: User }>(),
);

export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: string }>(),
);
