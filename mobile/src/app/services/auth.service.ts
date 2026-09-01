import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
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
  address?: string;
  profileImage?: string;
  avatar_url?: string;
  student_id?: string;
  batch_id?: number | string;
  status?: string;
  jathagam_details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Automatically load fresh profile if token exists on startup
    if (this.getToken()) {
      this.refreshProfileFromDb().subscribe();
    }
  }

  clearSession(): void {
    const keys = [
      'auth_token', 'astro_auth_token', 'edu_auth_token',
      'auth_user', 'astro_auth_user', 'edu_auth_user',
      'active_service'
    ];
    keys.forEach(k => {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch (e) { }
    });
    this.currentUserSubject.next(null);
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
        if (res && res.success && res.token) {
          this.clearSession();
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('active_service', service);
          if (res.user) {
            this.currentUserSubject.next(res.user);
          }
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
        if (res && res.success && res.token) {
          this.clearSession();
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('active_service', service);
          if (res.user) {
            this.currentUserSubject.next(res.user);
          }
        }
      })
    );
  }

  logout(service: 'astrology' | 'education' = 'astrology'): Observable<any> {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}, this.getAuthHeaders()).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.clearSession();
    return of({ success: true });
  }

  isLoggedIn(service?: 'astrology' | 'education'): boolean {
    const hasToken = !!this.getToken();
    if (!hasToken) return false;

    if (service) {
      const activeService = localStorage.getItem('active_service') || 'astrology';
      return activeService === service;
    }
    return true;
  }

  refreshProfileFromDb(): Observable<any> {
    if (!this.getToken()) {
      return of(null);
    }
    return this.http.get<any>(`${this.apiUrl}/user/profile?_t=${Date.now()}`, this.getAuthHeaders()).pipe(
      tap(res => {
        if (res) {
          const userObj: User = res.user ? res.user : res;
          this.currentUserSubject.next(userObj);
        }
      }),
      catchError(err => {
        if (err && err.status === 401) {
          // Stale/expired/wiped token in DB -> clear cleanly
          this.clearSession();
        }
        return of(null);
      })
    );
  }

  getUserProfileFromDb(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/profile?_t=${Date.now()}`, this.getAuthHeaders()).pipe(
      tap(res => {
        if (res) {
          const userObj: User = res.user ? res.user : res;
          this.currentUserSubject.next(userObj);
        }
      }),
      catchError(err => {
        if (err && err.status === 401) {
          this.clearSession();
        }
        return of(null);
      })
    );
  }

  getCurrentUser(service?: 'astrology' | 'education'): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    if (!user) return;
    const updated = { ...this.currentUserSubject.value, ...user };
    this.currentUserSubject.next(updated);
    try {
      localStorage.setItem('auth_user', JSON.stringify(updated));
      localStorage.setItem('astro_auth_user', JSON.stringify(updated));
    } catch (e) { }
  }

  getToken(service?: 'astrology' | 'education'): string | null {
    try {
      return (
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token') ||
        localStorage.getItem('astro_auth_token') ||
        localStorage.getItem('edu_auth_token')
      );
    } catch (e) {
      return null;
    }
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

