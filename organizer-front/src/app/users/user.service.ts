import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  contrasena: string;
}

export interface UpdateUserRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  contrasena?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


