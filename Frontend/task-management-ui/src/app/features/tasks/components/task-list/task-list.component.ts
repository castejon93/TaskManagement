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
