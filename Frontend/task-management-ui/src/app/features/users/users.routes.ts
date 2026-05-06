import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { usersReducer } from './store/users.reducer';
import { UsersEffects } from './store/users.effects';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('users', usersReducer),
      provideEffects(UsersEffects)
    ],
    loadComponent: () =>
      import('./users-shell.component').then(m => m.UsersShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users.component').then(m => m.UsersComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  }
];
