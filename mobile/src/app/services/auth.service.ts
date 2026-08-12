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
  private readonly REG_USERS_KEY = 'astro_registered_users';

  // Separate session keys
  private getAuthKey(service: 'astrology' | 'education'): string {
    return `astro_auth_user_${service}`;
  }

  // Default credentials
  private defaultAstrologyUser: User = {
    fullName: 'ஜோதிட பயனர்',
    mobileNumber: '9876543210',
    emailAddress: 'astrology@example.com',
    password: '123456'
  };

  private defaultEducationUser: User = {
    fullName: 'கல்வி பயனர்',
    mobileNumber: '9876543210',
    emailAddress: 'education@example.com',
    password: '654321' // Different password as requested
  };

  constructor() {
    const users = this.getRegisteredUsers();
    // Seed default users if not already present
    if (!users.find(u => u.mobileNumber === this.defaultAstrologyUser.mobileNumber && u.emailAddress === this.defaultAstrologyUser.emailAddress)) {
      users.push(this.defaultAstrologyUser);
    }
    if (!users.find(u => u.mobileNumber === this.defaultEducationUser.mobileNumber && u.emailAddress === this.defaultEducationUser.emailAddress)) {
      users.push(this.defaultEducationUser);
    }
    localStorage.setItem(this.REG_USERS_KEY, JSON.stringify(users));
  }

  getRegisteredUsers(): User[] {
    const data = localStorage.getItem(this.REG_USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  register(user: User, service: 'astrology' | 'education' = 'astrology'): boolean {
    const users = this.getRegisteredUsers();
    // To allow different signups for same mobile on different services, check by both mobile and email/name
    if (users.find(u => u.mobileNumber === user.mobileNumber && u.emailAddress === user.emailAddress)) {
      return false; // User already exists with this mobile & email combination
    }
    const newUser = { ...user, password: user.password || (service === 'education' ? '654321' : '123456') };
    users.push(newUser);
    localStorage.setItem(this.REG_USERS_KEY, JSON.stringify(users));
    
    // Auto login
    this.setCurrentUser(newUser, service);
    return true;
  }

  login(mobileNumber: string, password?: string, service: 'astrology' | 'education' = 'astrology'): boolean {
    const users = this.getRegisteredUsers();
    // Filter matching user accounts
    const matchedUser = users.find(u => u.mobileNumber === mobileNumber && (!password || u.password === password));
    if (matchedUser) {
      this.setCurrentUser(matchedUser, service);
      return true;
    }
    return false;
  }

  logout(service: 'astrology' | 'education' = 'astrology'): void {
    localStorage.removeItem(this.getAuthKey(service));
  }

  isLoggedIn(service: 'astrology' | 'education' = 'astrology'): boolean {
    return localStorage.getItem(this.getAuthKey(service)) !== null;
  }

  getCurrentUser(service: 'astrology' | 'education' = 'astrology'): User | null {
    const data = localStorage.getItem(this.getAuthKey(service));
    return data ? JSON.parse(data) : null;
  }

  private setCurrentUser(user: User, service: 'astrology' | 'education'): void {
    localStorage.setItem(this.getAuthKey(service), JSON.stringify(user));
  }

  forgotPassword(mobileNumber: string, service: 'astrology' | 'education' = 'astrology'): string | null {
    const users = this.getRegisteredUsers();
    // Return matching user
    const user = users.find(u => u.mobileNumber === mobileNumber);
    if (user) {
      return user.password || (service === 'education' ? '654321' : '123456');
    }
    return null;
  }
}
