import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const isLoggedIn = localStorage.getItem('token');
  console.log("\n\n isLoggedIn ==> ", isLoggedIn)

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};