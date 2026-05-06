import { Routes } from '@angular/router';

// Lazy loading: each feature module is only downloaded when the user
// navigates to that route — improves initial load performance.
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    // loadChildren returns a Promise — Angular downloads the chunk on demand.
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES)
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];