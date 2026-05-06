import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadUsers } from '../users/store/users.actions';

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
