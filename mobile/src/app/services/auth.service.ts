import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  fullName?: string;
  name?: string;
  mobileNumber?: string;
  phone?: string;
  emailAddress?: string;
  email?: string;
  password?: string;
  role?: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(user: User, service: 'astrology' | 'education' = 'astrology'): Observable<any> {
    const payload = {
      name: user.fullName || user.name,
      email: user.emailAddress || user.email,
      password: user.password || 'test123',
      phone: user.mobileNumber || user.phone
    };

    return this.http.post<any>(`${this.apiUrl}/auth/register`, payload).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('auth_token', res.token);
          
          // Merge local profileImage if backend doesn't support it yet
          const userToSave = { ...res.user, profileImage: user.profileImage };
          localStorage.setItem('auth_user', JSON.stringify(userToSave));
        }
      })
    );
  }

  login(input: string, password?: string, service: 'astrology' | 'education' = 'astrology'): Observable<any> {
    const payload = {
      email: input,
      password: password || ''
    };

    return this.http.post<any>(`${this.apiUrl}/auth/mobile-login`, payload).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(service: 'astrology' | 'education' = 'astrology'): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem(`astro_auth_user_${service}`);
  }

  isLoggedIn(service: 'astrology' | 'education' = 'astrology'): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(service: 'astrology' | 'education' = 'astrology'): User | null {
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getAuthHeaders(): { headers: { [header: string]: string } } {
    const token = this.getToken();
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
  }

  forgotPassword(mobileNumber: string, service: 'astrology' | 'education' = 'astrology'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, { phone: mobileNumber });
  }
}
