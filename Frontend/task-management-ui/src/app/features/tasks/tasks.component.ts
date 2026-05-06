import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadTasks } from './store/tasks.actions';
import { loadUsers } from '../users/store/users.actions';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
    this.store.dispatch(loadTasks({ filters: { userId: null, statusId: null } }));
  }
}
