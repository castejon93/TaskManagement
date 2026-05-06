import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from './core/services/notification.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <!-- ── App toolbar ───────────────────────────────────────── -->
    <mat-toolbar color="primary">
      <span>WTW - Task Management</span>
      <span class="toolbar-spacer"></span>
      <nav class="toolbar-nav">
        <a routerLink="/tasks" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:false}"
           class="nav-link">
          <mat-icon>task_alt</mat-icon> Tasks
        </a>
        <a routerLink="/users" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:false}"
           class="nav-link">
          <mat-icon>group</mat-icon> Users
        </a>
      </nav>
      <span class="toolbar-version">v1.0.0</span>
    </mat-toolbar>

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
    <div class="app-footer">Luis Castejon</div>
  `,
  styleUrl: './app.scss'
})
export class App {
  readonly notify  = inject(NotificationService);
  readonly loading = inject(LoadingService);
}
