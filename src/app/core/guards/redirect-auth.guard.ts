import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const redirectAuthGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Verify if the loggedIn user's email exists as User state
  if (authService.currentUserValue && authService.currentUserValue.email) {
    router.navigate(['/task']);
    return false;
  }
  return true;
};
