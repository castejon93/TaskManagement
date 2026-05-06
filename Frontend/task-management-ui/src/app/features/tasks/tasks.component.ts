import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadUsers } from '../users/store/users.actions';

/**
 * Shell component for the /tasks feature route.
 * Its only job is to render <router-outlet> for child routes (task-list, task-form).
 *
 * loadUsers() is dispatched here rather than in TaskFormComponent so the user list
 * is already in the store when the form renders, avoiding a visible loading flash
 * in the assignee dropdown.
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(loadUsers());
  }
}
