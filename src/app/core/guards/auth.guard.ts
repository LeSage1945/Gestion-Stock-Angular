import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // IMPORTANT :
  // côté serveur on laisse passer
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (
    token &&
    token !== 'null' &&
    token !== 'undefined'
  ) {
    return true;
  }

  return router.createUrlTree(['/login']);
};