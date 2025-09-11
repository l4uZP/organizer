import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  role: 'admin' | 'generic';
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  contrasena: string;
  role: 'admin' | 'generic';
}

export interface UpdateUserRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  contrasena?: string;
  role?: 'admin' | 'generic';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  create(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload, { headers: this.authHeaders() });
  }

  update(id: number, payload: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, payload, { headers: this.authHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }
}


