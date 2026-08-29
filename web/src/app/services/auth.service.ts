import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'astrologer' | 'super_admin' | string;
  phone?: string;
  avatar_url?: string;
  status?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  is_student?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined' && this.getToken()) {
      this.getProfileFromDb().subscribe();
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/web-login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_token', res.token);
          }
          this.currentUser = res.user;
        }
      })
    );
  }

  logout(notifyBackend: boolean = true): void {
    const token = this.getToken();

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.currentUser = null;

    if (token && notifyBackend) {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    if (typeof window !== 'undefined') {
      this.router.navigate(['/login']);
    }
  }

  getProfileFromDb(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`, this.getAuthHeaders()).pipe(
      tap(res => {
        if (res && res.user) {
          this.currentUser = res.user;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('user_data', JSON.stringify(res.user));
          }
        }
      }),
      catchError(err => {
        if (err && err.status === 401) {
          this.logout(false);
        }
        return of(null);
      })
    );
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    if (this.currentUser) return this.currentUser;
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  setUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return !!user && (user.role === 'admin' || user.role === 'astrologer' || user.role === 'super_admin');
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    };
  }
}

