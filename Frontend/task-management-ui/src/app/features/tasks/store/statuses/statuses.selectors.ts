import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StatusesState, selectAll } from './statuses.reducer';

const selectStatusesState = createFeatureSelector<StatusesState>('statuses');

export const selectAllStatuses    = createSelector(selectStatusesState, selectAll);
export const selectStatusesLoading = createSelector(selectStatusesState, (s) => s.loading);
