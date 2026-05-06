import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskStatus } from '../models/task-status';
import { SKIP_LOADING } from '../interceptors/loading';

@Injectable({ providedIn: 'root' })
export class StatusesApiService {

    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/statuses`;
    // Statuses are loaded silently on app init; suppress the global overlay.
    private readonly ctx = new HttpContext().set(SKIP_LOADING, true);

    getAll(): Observable<TaskStatus[]> {
        return this.http.get<TaskStatus[]>(this.base, { context: this.ctx });
    }
}
