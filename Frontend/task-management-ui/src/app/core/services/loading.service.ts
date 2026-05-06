import { Injectable, signal, computed } from '@angular/core';

/**
 * Tracks the number of active HTTP requests that are NOT skipped by SKIP_LOADING.
 * Uses a reference-count so that concurrent requests do not prematurely hide the spinner.
 * `isLoading` becomes true as soon as any request is in flight and false once all complete.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** Reference count — incremented on request start, decremented on finalize. */
  private readonly _count = signal(0);

  /** Derived signal consumed by the shell to show / hide the global overlay spinner. */
  readonly isLoading = computed(() => this._count() > 0);

  increment(): void {
    this._count.update((n) => n + 1);
  }

  /** Math.max guards against decrement-below-zero if finalize fires more than once. */
  decrement(): void {
    this._count.update((n) => Math.max(0, n - 1));
  }
}
