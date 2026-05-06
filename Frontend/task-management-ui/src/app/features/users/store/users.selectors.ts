import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState, selectAll } from './users.reducer';

const selectUsersState = createFeatureSelector<UsersState>('users');

// Memoized selectors — recompute only when the input slice changes.
// Components subscribe to these; they never touch the state directly.
export const selectAllUsers = createSelector(selectUsersState, selectAll);
export const selectUsersLoading = createSelector(selectUsersState, (s) => s.loading);
export const selectUsersError = createSelector(selectUsersState, (s) => s.error);
