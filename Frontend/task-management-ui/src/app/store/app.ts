import { UsersState } from '../features/users/store/users.reducer';
import { TasksState } from '../features/tasks/store/tasks.reducer';

// Root state shape — each feature slice is registered via its own reducer.
export interface AppState {
  users: UsersState;
  tasks: TasksState;
}
