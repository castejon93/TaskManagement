import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { tasksReducer } from './store/tasks.reducer';
import { TasksEffects } from './store/tasks.effects';
import { usersReducer } from '../users/store/users.reducer';
import { UsersEffects } from '../users/store/users.effects';
import { statusesReducer } from './store/statuses/statuses.reducer';
import { StatusesEffects } from './store/statuses/statuses.effects';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    // Register tasks + users + statuses NgRx slices for the whole feature subtree.
    providers: [
      provideState('tasks', tasksReducer),
      provideState('users', usersReducer),
      provideState('statuses', statusesReducer),
      provideEffects(TasksEffects, UsersEffects, StatusesEffects),
    ],
    // Shell component that holds <router-outlet> for child routes.
    loadComponent: () => import('./tasks.component').then((m) => m.TasksComponent),
    children: [
      {
        // Default child — dashboard with task table and filters.
        path: '',
        loadComponent: () =>
          import('./components/task-list/list.component').then((m) => m.TaskListComponent),
      },
      {
        // Create task form — navigated to via the "New Task" button.
        path: 'new',
        loadComponent: () =>
          import('./components/task-form/task-form.component').then((m) => m.TaskFormComponent),
      },
    ],
  },
];
