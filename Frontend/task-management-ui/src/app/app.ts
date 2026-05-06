import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from './core/services/notification';
import { LoadingService } from './core/services/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule, MatIconModule],
  template: `
    <!-- ── Global top notification banner ────────────────────── -->
    @if (notify.notification(); as n) {
      <div class="app-notification" [class]="'app-notification--' + n.type" role="alert">
        <mat-icon class="notif-icon">
          @if (n.type === 'success') { check_circle }
          @else if (n.type === 'error') { error }
          @else { warning }
        </mat-icon>
        <span class="notif-message">{{ n.message }}</span>
        <button class="notif-close" (click)="notify.dismiss()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }

    <!-- ── Global loading overlay ─────────────────────────────── -->
    @if (loading.isLoading()) {
      <div class="loading-overlay" aria-live="polite" aria-label="Loading">
        <mat-spinner diameter="56" />
      </div>
    }

    <router-outlet />
  `,
  styleUrl: './app.scss'
})
export class App {
  readonly notify  = inject(NotificationService);
  readonly loading = inject(LoadingService);
}
