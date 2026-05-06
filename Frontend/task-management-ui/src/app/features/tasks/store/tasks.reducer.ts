import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Task } from '../../../core/models/task';
import * as TasksActions from './tasks.actions';

export interface TasksState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
}

const adapter: EntityAdapter<Task> = createEntityAdapter<Task>();

const initialState: TasksState = adapter.getInitialState({
  loading: false,
  error: null,
});

export const tasksReducer = createReducer(
  initialState,

  on(TasksActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),

  on(TasksActions.loadTasksSuccess, (state, { tasks }) =>
    adapter.setAll(tasks, { ...state, loading: false }),
  ),

  on(TasksActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(TasksActions.createTaskSuccess, (state, { task }) => adapter.addOne(task, state)),

  // upsertOne replaces the existing task with the same id — used for status update.
  on(TasksActions.updateTaskStatusSuccess, (state, { task }) => adapter.upsertOne(task, state)),
);

export const { selectAll } = adapter.getSelectors();
