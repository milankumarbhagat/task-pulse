import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  console.log("\n\n token11 ==> ", token);

  if (token) {
    return authService.verifyToken(token).pipe(
      map(() => true),
      catchError(() => {
        authService.logout();
        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  router.navigate(['/login']);
  return false;
};