import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, selectAll } from './tasks.reducer';

const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectAllTasks = createSelector(selectTasksState, selectAll);
export const selectTasksLoading = createSelector(selectTasksState, (s) => s.loading);
