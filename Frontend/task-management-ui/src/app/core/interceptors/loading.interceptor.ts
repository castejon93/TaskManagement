import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Set this token to `true` on any request that manages its own loading state
 * (e.g. via NgRx) to prevent the global overlay spinner from appearing.
 *
 * Usage:
 *   this.http.get(url, { context: new HttpContext().set(SKIP_LOADING, true) })
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/** Increments the loading counter when a request starts and decrements when it completes or errors. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.increment();
  return next(req).pipe(finalize(() => loading.decrement()));
};
