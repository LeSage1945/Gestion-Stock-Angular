import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const abonnementGuard: CanActivateFn = () => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // SSR / Server
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const abonnement = localStorage.getItem('abonnement');

  if (abonnement === 'ACTIF') {
    return true;
  }

  return router.createUrlTree(['/abonnement']);
};