import { Injectable } from '@angular/core';

export interface User {
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'astro_auth_user';
  private readonly REG_USERS_KEY = 'astro_registered_users';

  // Default mock user credentials
  private defaultUser: User = {
    fullName: 'Default User',
    mobileNumber: '9876543210',
    emailAddress: 'user@example.com',
    password: '123456'
  };

  constructor() {
    // Seed default user if not exists
    const users = this.getRegisteredUsers();
    if (!users.find(u => u.mobileNumber === this.defaultUser.mobileNumber)) {
      users.push(this.defaultUser);
      localStorage.setItem(this.REG_USERS_KEY, JSON.stringify(users));
    }
  }

  getRegisteredUsers(): User[] {
    const data = localStorage.getItem(this.REG_USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  register(user: User): boolean {
    const users = this.getRegisteredUsers();
    if (users.find(u => u.mobileNumber === user.mobileNumber)) {
      return false; // already exists
    }
    // For simplicity, default password is set to 123456 if none provided
    const newUser = { ...user, password: user.password || '123456' };
    users.push(newUser);
    localStorage.setItem(this.REG_USERS_KEY, JSON.stringify(users));
    
    // Auto login
    this.setCurrentUser(newUser);
    return true;
  }

  login(mobileNumber: string, password?: string): boolean {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.mobileNumber === mobileNumber);
    if (user && (!password || user.password === password)) {
      this.setCurrentUser(user);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.AUTH_KEY) !== null;
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
  }

  forgotPassword(mobileNumber: string): string | null {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.mobileNumber === mobileNumber);
    return user ? (user.password || '123456') : null;
  }
}
