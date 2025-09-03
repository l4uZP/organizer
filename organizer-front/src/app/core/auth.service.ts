import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  user: string;
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
          storage.setItem(AuthService.AUTH_USER_KEY, res.user);
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
    const user = localStorage.getItem(AuthService.AUTH_USER_KEY) || sessionStorage.getItem(AuthService.AUTH_USER_KEY);
    return user || null;
  }
}
