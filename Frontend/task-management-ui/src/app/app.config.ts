import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error';
import { loadingInterceptor } from './core/interceptors/loading';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone-based change detection with event coalescing — reduces unnecessary
    // change detection cycles when multiple events fire in the same microtask.
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes, withComponentInputBinding()),

    // Register interceptors globally — loading tracks request count, error shows notifications.
    provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor])),

    provideAnimationsAsync(),

    // Empty root store — feature reducers are registered in their lazy routes.
    provideStore(),
    provideEffects(),

    // NgRx DevTools — only active in development (inspect state in browser).
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production })
  ]
};