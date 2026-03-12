import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, dto)
      .pipe(tap((response) => this.storeTokens(response)));
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, dto)
      .pipe(tap((response) => this.storeTokens(response)));
  }

  refreshToken(): Observable<{ access_token: string; refresh_token: string }> {
    const userId = this.getUser()?.id;
    const refresh_token = localStorage.getItem('refresh_token');
    return this.http
      .post<{
        access_token: string;
        refresh_token: string;
      }>(`${this.apiUrl}/refresh`, { userId, refresh_token })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }),
      );
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    void this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user) as AuthResponse['user']) : null;
  }

  private storeTokens(response: AuthResponse): void {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  updateProfile(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
  }): Observable<AuthResponse['user']> {
    return this.http.patch<AuthResponse['user']>(`${this.apiUrl}/profile`, data).pipe(
      tap((user) => {
        const stored = this.getUser();
        localStorage.setItem('user', JSON.stringify({ ...stored, ...user }));
      }),
    );
  }
}
