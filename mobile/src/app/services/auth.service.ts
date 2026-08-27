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

  constructor(private http: HttpClient) { }

  private getTokenKey(service: 'astrology' | 'education'): string {
    return service === 'education' ? 'edu_auth_token' : 'astro_auth_token';
  }

  private getUserKey(service: 'astrology' | 'education'): string {
    return service === 'education' ? 'edu_auth_user' : 'astro_auth_user';
  }

  clearSession(): void {
    const keys = [
      'auth_token', 'astro_auth_token', 'edu_auth_token',
      'auth_user', 'astro_auth_user', 'edu_auth_user'
    ];
    keys.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
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
          this.clearSession();

          const tKey = this.getTokenKey(service);
          const uKey = this.getUserKey(service);

          localStorage.setItem(tKey, res.token);
          sessionStorage.setItem(tKey, res.token);
          localStorage.setItem('auth_token', res.token);
          sessionStorage.setItem('auth_token', res.token);

          const userToSave = { ...res.user, profileImage: user.profileImage };
          localStorage.setItem(uKey, JSON.stringify(userToSave));
          sessionStorage.setItem(uKey, JSON.stringify(userToSave));
          localStorage.setItem('auth_user', JSON.stringify(userToSave));
          sessionStorage.setItem('auth_user', JSON.stringify(userToSave));
        }
      })
    );
  }

  login(input: string, password?: string, service: 'astrology' | 'education' = 'astrology'): Observable<any> {
    const payload = {
      email: input,
      password: password || '',
      service: service
    };

    return this.http.post<any>(`${this.apiUrl}/auth/mobile-login`, payload).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.clearSession();

          const tKey = this.getTokenKey(service);
          const uKey = this.getUserKey(service);

          localStorage.setItem(tKey, res.token);
          sessionStorage.setItem(tKey, res.token);
          localStorage.setItem(uKey, JSON.stringify(res.user));
          sessionStorage.setItem(uKey, JSON.stringify(res.user));

          localStorage.setItem('auth_token', res.token);
          sessionStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify(res.user));
          sessionStorage.setItem('auth_user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(service: 'astrology' | 'education' = 'astrology'): void {
    this.clearSession();
  }

  isLoggedIn(service?: 'astrology' | 'education'): boolean {
    if (service) {
      const key = this.getTokenKey(service);
      return !!(localStorage.getItem(key) || sessionStorage.getItem(key));
    }
    return !!(
      sessionStorage.getItem('edu_auth_token') ||
      sessionStorage.getItem('astro_auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('edu_auth_token') ||
      localStorage.getItem('astro_auth_token') ||
      localStorage.getItem('auth_token')
    );
  }

  getUserProfileFromDb(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/profile?_t=${Date.now()}`, this.getAuthHeaders());
  }

  getCurrentUser(service?: 'astrology' | 'education'): User | null {
    if (service) {
      const data =
        sessionStorage.getItem(this.getUserKey(service)) ||
        localStorage.getItem(this.getUserKey(service));
      if (data) return JSON.parse(data);
    }
    const data =
      sessionStorage.getItem('auth_user') ||
      sessionStorage.getItem('astro_auth_user') ||
      sessionStorage.getItem('edu_auth_user') ||
      localStorage.getItem('auth_user') ||
      localStorage.getItem('astro_auth_user') ||
      localStorage.getItem('edu_auth_user');
    return data ? JSON.parse(data) : null;
  }

  getToken(service?: 'astrology' | 'education'): string | null {
    if (service) {
      const t =
        sessionStorage.getItem(this.getTokenKey(service)) ||
        localStorage.getItem(this.getTokenKey(service));
      if (t) return t;
    }
    return (
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('astro_auth_token') ||
      sessionStorage.getItem('edu_auth_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('astro_auth_token') ||
      localStorage.getItem('edu_auth_token')
    );
  }

  getAuthHeaders(service?: 'astrology' | 'education'): { headers: { [header: string]: string } } {
    const token = this.getToken(service);
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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

  getPublicBatches(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/batches`);
  }
}
