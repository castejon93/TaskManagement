import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TaskStatus } from '../models/task-status';

@Injectable({ providedIn: 'root' })
export class StatusesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/statuses`;

  // Fetched once on first subscription; all subsequent subscribers get the cached result.
  readonly statuses$ = this.http.get<TaskStatus[]>(this.base).pipe(shareReplay(1));
}
