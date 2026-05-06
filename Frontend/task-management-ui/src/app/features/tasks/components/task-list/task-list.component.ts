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
import { distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';
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
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
/**
 * Dashboard component rendered at /tasks (the default child route).
 * Displays a sortable mat-table of all tasks with an optional status filter.
 * The status filter drives a loadTasks dispatch so the store always reflects the view.
 */
export class TaskListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly statusesApi = inject(StatusesApiService);
  /** Completes on destroy to automatically unsubscribe from the filter valueChanges stream. */
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;

  /** Status options loaded once and cached by shareReplay(1) in StatusesApiService. */
  readonly statuses = toSignal(this.statusesApi.statuses$, { initialValue: [] });
  readonly columns = ['title', 'description', 'user', 'status', 'createdAt', 'actions'];
  /** null = show all statuses; non-null = filter by that status id. */
  readonly statusFilter = new FormControl<number | null>(null);
  /** Bridges the NgRx selector to a signal consumed directly in the template. */
  readonly tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] });
  readonly loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });
  /** MatTableDataSource enables client-side sorting without an additional selector. */
  readonly dataSource = new MatTableDataSource<Task>();

  constructor() {
    // Keep the MatTableDataSource in sync whenever the NgRx task signal changes.
    effect(() => {
      this.dataSource.data = this.tasks();
    });
  }

  ngAfterViewInit(): void {
    // Attach the sort header directive after the view is fully initialized.
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    // startWith(null) triggers an immediate dispatch on mount without a separate ngOnInit call.
    this.statusFilter.valueChanges
      .pipe(startWith(null), distinctUntilChanged(), takeUntil(this.destroy$))
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

  /** Advances a task to the next sequential status by incrementing its statusId. */
  advanceStatus(task: Task): void {
    this.store.dispatch(
      updateTaskStatus({ id: task.id, request: { newStatusId: task.statusId + 1 } }),
    );
  }

  /** Returns the name of the next status, used to label the Advance button tooltip. */
  nextStatusName(currentStatusId: number): string {
    return this.statuses().find((s) => s.id === currentStatusId + 1)?.name ?? '';
  }

  /** Formats the task's custom fields into a compact comma-separated string for the tooltip. */
  metaSummary(task: Task): string {
    const m = parseMetadata(task.additionalInfo);
    const parts: string[] = [];

    const cfEntries = Object.entries(m.customFields ?? {});
    if (cfEntries.length) parts.push(cfEntries.map(([k, v]) => `${k}: ${v}`).join(', '));
    return parts.join(' | ') || 'No metadata';
  }
}
