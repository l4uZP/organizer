import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: 'admin' | 'generic';
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  token: string;
  user: UserResponse;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly AUTH_TOKEN_KEY = 'auth_token';
  private static readonly AUTH_USER_KEY = 'auth_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.readIsAuthenticated());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  private readIsAuthenticated(): boolean {
    const hasLocal = typeof localStorage !== 'undefined' && !!localStorage.getItem(AuthService.AUTH_TOKEN_KEY);
    const hasSession = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem(AuthService.AUTH_TOKEN_KEY);
    return hasLocal || hasSession;
  }

  login(username: string, password: string, remember: boolean): Observable<boolean> {
    try {
      sessionStorage.removeItem(AuthService.AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AuthService.AUTH_USER_KEY);
      localStorage.removeItem(AuthService.AUTH_TOKEN_KEY);
      localStorage.removeItem(AuthService.AUTH_USER_KEY);
    } catch {}

    const body = { username, password, remember };
    return this.http.post<LoginResponse>('http://localhost:8080/api/v1/auth/login', body)
      .pipe(map((res) => {
        const storage = remember ? localStorage : sessionStorage;
        try {
          storage.setItem(AuthService.AUTH_TOKEN_KEY, res.token);
          storage.setItem(AuthService.AUTH_USER_KEY, JSON.stringify(res.user));
        } catch {}
        this.isAuthenticatedSubject.next(true);
        return true;
      }));
  }

  logout(): void {
    try {
      sessionStorage.removeItem(AuthService.AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AuthService.AUTH_USER_KEY);
      localStorage.removeItem(AuthService.AUTH_TOKEN_KEY);
      localStorage.removeItem(AuthService.AUTH_USER_KEY);
    } catch {}
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.readIsAuthenticated();
  }

  getCurrentUsername(): string | null {
    const raw = localStorage.getItem(AuthService.AUTH_USER_KEY) || sessionStorage.getItem(AuthService.AUTH_USER_KEY);
    if (!raw) return null;
    try {
      const u: UserResponse = JSON.parse(raw);
      return u.username;
    } catch {
      return raw;
    }
  }

  getCurrentUser(): UserResponse | null {
    const raw = localStorage.getItem(AuthService.AUTH_USER_KEY) || sessionStorage.getItem(AuthService.AUTH_USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as UserResponse; } catch { return null; }
  }

  isAdmin(): boolean {
    const u = this.getCurrentUser();
    if (u && u.role === 'admin') return true;
    const roleFromToken = this.getRoleFromToken();
    return roleFromToken === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.AUTH_TOKEN_KEY) || sessionStorage.getItem(AuthService.AUTH_TOKEN_KEY);
  }

  private getRoleFromToken(): 'admin' | 'generic' | null {
    const token = this.getToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const payload = JSON.parse(atob(parts[1]));
      const r = payload?.role;
      return r === 'admin' ? 'admin' : r === 'generic' ? 'generic' : null;
    } catch {
      return null;
    }
  }
}
