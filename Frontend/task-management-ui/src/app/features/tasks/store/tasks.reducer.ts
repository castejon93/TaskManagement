import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Task } from '../../../core/models/task';
import * as TasksActions from './tasks.actions';

/**
 * EntityAdapter normalizes tasks into { ids: number[], entities: Record<number, Task> }.
 * This gives O(1) lookup by id and makes upsert / remove operations trivial.
 */
export interface TasksState extends EntityState<Task> {
  /** True while the load or create HTTP request is in flight. */
  loading: boolean;
  /** Populated on failure; components may surface this or rely on the global toast. */
  error: string | null;
}

const adapter: EntityAdapter<Task> = createEntityAdapter<Task>();

const initialState: TasksState = adapter.getInitialState({
  loading: false,
  error: null,
});

export const tasksReducer = createReducer(
  initialState,

  // Clear any previous error so stale error messages don't persist across reloads.
  on(TasksActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),

  // setAll replaces the entire collection — correct for a filtered load where removed tasks
  // should no longer appear in the table.
  on(TasksActions.loadTasksSuccess, (state, { tasks }) =>
    adapter.setAll(tasks, { ...state, loading: false }),
  ),

  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // addOne appends the freshly created task returned by the API without re-fetching.
  on(TasksActions.createTaskSuccess, (state, { task }) => adapter.addOne(task, state)),

  // upsertOne replaces the existing task with the same id — used for status update.
  on(TasksActions.updateTaskStatusSuccess, (state, { task }) => adapter.upsertOne(task, state)),
);

/** Re-exported so selectors can compose without coupling to the adapter instance. */
export const { selectAll } = adapter.getSelectors();
