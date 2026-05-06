import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { loadTasks } from './store/tasks.actions';
import { loadUsers } from '../users/store/users.actions';
import { loadStatuses } from './store/statuses/statuses.actions';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
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
    <router-outlet />
    <div class="app-footer">Luis Castejon</div>
  `,
  styles: [`
    .toolbar-spacer { flex: 1; }
    .toolbar-nav { display: flex; gap: 4px; margin-right: 16px; }
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 6px;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
    }
    .nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .nav-link.nav-active { background: rgba(255,255,255,0.15); color: #fff; }
    .toolbar-version { font-size: 12px; opacity: 0.7; letter-spacing: 0.05em; }
    .app-footer {
      position: fixed; bottom: 12px; right: 16px;
      font-size: 12px; color: #8b949e; pointer-events: none; z-index: 100;
    }
  `]
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
    this.store.dispatch(loadTasks({ filters: { userId: null, statusId: null } }));
    this.store.dispatch(loadStatuses());
  }
}
