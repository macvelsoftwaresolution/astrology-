import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'astrologer' | 'super_admin' | string;
  phone?: string;
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

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/web-login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          sessionStorage.setItem('auth_token', res.token);
          sessionStorage.setItem('user_data', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('auth_token');
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }

  setUser(user: User): void {
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
        'Content-Type': 'application/json'
      }
    };
  }
}
