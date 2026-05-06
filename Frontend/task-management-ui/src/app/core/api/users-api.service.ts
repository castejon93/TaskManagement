import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest } from '../models/user';

@Injectable({ providedIn: 'root' })  // Singleton — provided once at root
export class UsersApiService {

    // inject() is the modern Angular alternative to constructor injection.
    // It works in injection context (constructor, field initializer, factory).
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/users`;

    // Returns an Observable — no HTTP call is made until subscribed.
    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.base);
    }

    create(request: CreateUserRequest): Observable<User> {
        return this.http.post<User>(this.base, request);
    }
}