import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest } from '../models/user';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class UsersApiService {

    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/users`;
    // Tracked by NgRx (selectUsersLoading) — suppresses the global overlay to avoid two spinners.
    private readonly ctx = new HttpContext().set(SKIP_LOADING, true);

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.base, { context: this.ctx });
    }

    create(request: CreateUserRequest): Observable<User> {
        return this.http.post<User>(this.base, request, { context: this.ctx });
    }
}