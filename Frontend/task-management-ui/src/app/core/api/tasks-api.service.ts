import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, CreateTaskRequest, UpdateTaskStatusRequest, TaskFilters } from '../models/task';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class TasksApiService {

    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/tasks`;
    // Requests here are tracked by NgRx (selectTasksLoading), so the global
    // overlay spinner is suppressed to avoid showing two loaders at once.
    private readonly ctx = new HttpContext().set(SKIP_LOADING, true);

    // Builds query params only for non-null filter values.
    // GET /api/tasks?userId=1&statusId=2
    getAll(filters: TaskFilters): Observable<Task[]> {
        let params = new HttpParams();
        if (filters.userId !== null) params = params.set('userId', filters.userId);
        if (filters.statusId !== null) params = params.set('statusId', filters.statusId);
        return this.http.get<Task[]>(this.base, { params, context: this.ctx });
    }

    create(request: CreateTaskRequest): Observable<Task> {
        return this.http.post<Task>(this.base, request, { context: this.ctx });
    }

    // PUT /api/tasks/{id}/status
    updateStatus(id: number, request: UpdateTaskStatusRequest): Observable<Task> {
        return this.http.put<Task>(`${this.base}/${id}/status`, request, { context: this.ctx });
    }
}