import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification';

// Functional interceptor (Angular 17+ style — no class needed).
// Catches all HTTP errors and shows a snackbar notification.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notification = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // The API returns { status, error, path } from GlobalExceptionMiddleware.
            const message = error.error?.error ?? 'An unexpected error occurred.';

            switch (error.status) {
                case 400: notification.error(`Validation error: ${message}`); break;
                case 404: notification.error(`Not found: ${message}`); break;
                case 409: notification.error(`Conflict: ${message}`); break;
                case 422: notification.error(`Business rule: ${message}`); break;
                default: notification.error(`Error ${error.status}: ${message}`);
            }

            // Re-throw so NgRx Effects can also catch it and dispatch failure actions.
            return throwError(() => error);
        })
    );
};