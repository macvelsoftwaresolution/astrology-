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

  private getTokenKey(service: 'astrology' | 'education'): string {
    return service === 'education' ? 'edu_auth_token' : 'astro_auth_token';
  }

  private getUserKey(service: 'astrology' | 'education'): string {
    return service === 'education' ? 'edu_auth_user' : 'astro_auth_user';
  }

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
          const tKey = this.getTokenKey(service);
          const uKey = this.getUserKey(service);
          localStorage.setItem(tKey, res.token);
          if (service === 'astrology') {
            localStorage.setItem('auth_token', res.token);
          }
          
          const userToSave = { ...res.user, profileImage: user.profileImage };
          localStorage.setItem(uKey, JSON.stringify(userToSave));
          if (service === 'astrology') {
            localStorage.setItem('auth_user', JSON.stringify(userToSave));
          }
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
          const tKey = this.getTokenKey(service);
          const uKey = this.getUserKey(service);
          localStorage.setItem(tKey, res.token);
          localStorage.setItem(uKey, JSON.stringify(res.user));
          if (service === 'astrology') {
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_user', JSON.stringify(res.user));
          }
        }
      })
    );
  }

  logout(service: 'astrology' | 'education' = 'astrology'): void {
    const tKey = this.getTokenKey(service);
    const uKey = this.getUserKey(service);
    localStorage.removeItem(tKey);
    localStorage.removeItem(uKey);
    if (service === 'astrology') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  isLoggedIn(service?: 'astrology' | 'education'): boolean {
    if (service) {
      const key = this.getTokenKey(service);
      return !!localStorage.getItem(key);
    }
    return !!(
      localStorage.getItem('edu_auth_token') ||
      localStorage.getItem('astro_auth_token') ||
      localStorage.getItem('auth_token')
    );
  }

  getCurrentUser(service?: 'astrology' | 'education'): User | null {
    if (service) {
      const data = localStorage.getItem(this.getUserKey(service));
      if (data) return JSON.parse(data);
    }
    const data =
      localStorage.getItem('edu_auth_user') ||
      localStorage.getItem('astro_auth_user') ||
      localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  getToken(service?: 'astrology' | 'education'): string | null {
    if (service) {
      const t = localStorage.getItem(this.getTokenKey(service));
      if (t) return t;
    }
    return (
      localStorage.getItem('edu_auth_token') ||
      localStorage.getItem('astro_auth_token') ||
      localStorage.getItem('auth_token')
    );
  }

  getAuthHeaders(service?: 'astrology' | 'education'): { headers: { [header: string]: string } } {
    const token = this.getToken(service);
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

  studentRegister(enrollData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/student-register`, enrollData);
  }

  fetchStudentDetails(query: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/fetch-student-details`, { query });
  }
}
