import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  effect,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { selectAllTasks, selectTasksLoading } from '../../store/tasks.selectors';
import { StatusesApiService } from '../../../../core/api/statuses-api.service';

import { loadTasks, updateTaskStatus } from '../../store/tasks.actions';
import { Task } from '../../../../core/models/task';
import { parseMetadata } from '../../../../core/utils/metadata.utils';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSortModule,
    StatusBadgeComponent,
    PageShellComponent,
  ],
  template: `
    <app-page-shell [loading]="loading()">
      <mat-form-field pageStart appearance="outline" subscriptSizing="dynamic">
        <mat-label>Status</mat-label>
        <mat-select [formControl]="statusFilter">
          <mat-option [value]="null">All Statuses</mat-option>
          @for (s of statuses(); track s.id) {
            <mat-option [value]="s.id">{{ s.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button pageEnd mat-raised-button class="btn-create" (click)="goToNewTask()">
        <mat-icon>add_task</mat-icon> New Task
      </button>

      <table pageContent
        mat-table
        matSort
        [dataSource]="dataSource"
        class="task-table mat-elevation-z2"
      >
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
              <td mat-cell *matCellDef="let task">{{ task.title }}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let task" class="desc-cell">
                {{ task.description ?? '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="userName">Assigned To</th>
              <td mat-cell *matCellDef="let task">{{ task.userName }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="statusName">Status</th>
              <td mat-cell *matCellDef="let task">
                <app-status-badge [status]="task.statusName" />
              </td>
            </ng-container>
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let task">{{ task.createdAt | date: 'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let task">
                <div class="actions-cell">
                  @if (task.statusId < 3) {
                    <button
                      class="advance-btn"
                      [class.advance-btn--yellow]="task.statusId === 1"
                      [class.advance-btn--green]="task.statusId === 2"
                      [matTooltip]="'Advance to ' + nextStatusName(task.statusId)"
                      (click)="advanceStatus(task)"
                    >
                      <mat-icon class="advance-icon">arrow_circle_right</mat-icon>
                      <span class="advance-label">{{ nextStatusName(task.statusId) }}</span>
                    </button>
                  } @else {
                    <span class="done-pill">
                      <mat-icon class="done-icon">check_circle</mat-icon>
                      Completed
                    </span>
                  }
                  @if (task.additionalInfo) {
                    <button
                      mat-icon-button
                      class="info-btn"
                      [matTooltip]="metaSummary(task)"
                      matTooltipClass="meta-tooltip"
                    >
                      <mat-icon>info_outline</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">No tasks found.</td>
            </tr>
      </table>
    </app-page-shell>
  `,
  styles: [
    `
      .task-table {
        width: 100%;
      }
      .desc-cell {
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Advance status button */
      .advance-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        border: none;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition:
          background-color 0.2s ease,
          box-shadow 0.2s ease;
        white-space: nowrap;
      }
      .advance-btn:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      }

      /* Pending → In Progress (yellow) */
      .advance-btn--yellow {
        background-color: #f9a825;
        color: #212121;
      }
      .advance-btn--yellow:hover {
        background-color: #f57f17;
      }

      /* In Progress → Done (green) */
      .advance-btn--green {
        background-color: #2e7d32;
        color: #fff;
      }
      .advance-btn--green:hover {
        background-color: #1b5e20;
      }

      .advance-icon {
        font-size: 18px;
        height: 18px;
        width: 18px;
      }

      /* Completed pill */
      .done-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 20px;
        background-color: #e8f5e9;
        color: #2e7d32;
        font-size: 13px;
        font-weight: 500;
      }
      .done-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        color: #2e7d32;
      }
      .actions-cell {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .info-btn {
        color: #58a6ff;
        opacity: 0.8;
      }
      .info-btn:hover {
        opacity: 1;
      }
    `,
  ],
})
export class TaskListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly statusesApi = inject(StatusesApiService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;

  readonly statuses = toSignal(this.statusesApi.statuses$, { initialValue: [] });
  readonly columns = ['title', 'description', 'user', 'status', 'createdAt', 'actions'];
  readonly statusFilter = new FormControl<number | null>(null);
  readonly tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] });
  readonly loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });
  readonly dataSource = new MatTableDataSource<Task>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.tasks();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.statusFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((statusId) => {
        this.store.dispatch(loadTasks({ filters: { userId: null, statusId } }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  advanceStatus(task: Task): void {
    this.store.dispatch(
      updateTaskStatus({ id: task.id, request: { newStatusId: task.statusId + 1 } }),
    );
  }

  nextStatusName(currentStatusId: number): string {
    return this.statuses().find((s) => s.id === currentStatusId + 1)?.name ?? '';
  }

  metaSummary(task: Task): string {
    const m = parseMetadata(task.additionalInfo);
    const parts: string[] = [];

    const cfEntries = Object.entries(m.customFields ?? {});
    if (cfEntries.length) parts.push(cfEntries.map(([k, v]) => `${k}: ${v}`).join(', '));
    return parts.join(' | ') || 'No metadata';
  }
}
