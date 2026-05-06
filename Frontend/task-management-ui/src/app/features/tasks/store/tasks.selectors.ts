import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, selectAll } from './tasks.reducer';

/**
 * Memoized selectors for the 'tasks' feature slice.
 * Components subscribe via toSignal() — these selectors recompute only when their
 * specific slice of state changes, preventing unnecessary re-renders.
 */

/** Root selector for the 'tasks' feature state registered in tasks.routes.ts. */
const selectTasksState = createFeatureSelector<TasksState>('tasks');

/** Returns all tasks as a flat array in insertion order. */
export const selectAllTasks = createSelector(selectTasksState, selectAll);

/** True while the GET /api/tasks request is in flight; drives the progress bar. */
export const selectTasksLoading = createSelector(selectTasksState, (s) => s.loading);
