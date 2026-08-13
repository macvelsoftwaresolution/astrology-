import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // In Angular SSR mode, window is undefined during initial server render. Allow hydration.
  if (typeof window === 'undefined') {
    return true;
  }

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

