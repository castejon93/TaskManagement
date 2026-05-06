import { Component, inject, OnInit, AfterViewInit, ViewChild, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { selectAllUsers, selectUsersLoading } from './store/users.selectors';
import { loadUsers } from './store/users.actions';
import { User } from '../../core/models/user';
import { PageShellComponent } from '../../shared/components/page-shell/page-shell.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    PageShellComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, AfterViewInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  @ViewChild(MatSort) sort!: MatSort;

  readonly columns = ['name', 'email', 'createdAt'];
  readonly users = toSignal(this.store.select(selectAllUsers), { initialValue: [] });
  readonly loading = toSignal(this.store.select(selectUsersLoading), { initialValue: false });
  readonly dataSource = new MatTableDataSource<User>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.users();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }

  goToNewUser(): void {
    this.router.navigate(['/users/new']);
  }
}
