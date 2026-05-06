import { Component, inject, OnInit, AfterViewInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { selectAllUsers, selectUsersLoading } from './store/users.selectors';
import { loadUsers } from './store/users.actions';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatCardModule, MatSortModule,
  ],
  template: `
    <div class="page-container">
      <mat-card class="table-card">
        <mat-card-content>

          <div class="action-bar">
            <div class="page-title">Users</div>
            <div class="actions">
              <button mat-raised-button class="btn-create" (click)="goToNewUser()">
                <mat-icon>person_add</mat-icon> New User
              </button>
            </div>
          </div>

          @if (loading()) {
            <div class="spinner-wrapper"><mat-spinner diameter="48" /></div>
          }

          <table mat-table matSort [dataSource]="dataSource" class="users-table mat-elevation-z2"
            [style.display]="loading() ? 'none' : ''">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let u">{{ u.createdAt | date:"mediumDate" }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">No users found.</td>
            </tr>
          </table>

        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .table-card { border-radius: 8px; }
    .action-bar {
      display: flex; align-items: center;
      justify-content: space-between; padding: 8px 0 16px;
    }
    .page-title { font-size: 16px; font-weight: 600; color: #e6edf3; }
    .actions { display: flex; gap: 8px; align-items: center; }
    .users-table { width: 100%; }
    .spinner-wrapper { display: flex; justify-content: center; padding: 48px; }
    .no-data { text-align: center; padding: 32px; color: #888; }
  `]
})
export class UsersComponent implements OnInit, AfterViewInit {
  private readonly store  = inject(Store);
  private readonly router = inject(Router);

  @ViewChild(MatSort) sort!: MatSort;

  readonly columns = ['name', 'email', 'createdAt'];
  readonly users   = toSignal(this.store.select(selectAllUsers),     { initialValue: [] });
  readonly loading = toSignal(this.store.select(selectUsersLoading), { initialValue: false });
  readonly dataSource = new MatTableDataSource<User>();

  constructor() {
    effect(() => { this.dataSource.data = this.users(); });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }

  goToNewUser(): void { this.router.navigate(['/users/new']); }
}
