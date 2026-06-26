// import { CanActivateFn, Router } from '@angular/router';
// import { inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';

// export const authGuard: CanActivateFn = () => {

//   const router = inject(Router);
//   const platformId = inject(PLATFORM_ID);

//   // IMPORTANT :
//   // côté serveur on laisse passer
//   if (!isPlatformBrowser(platformId)) {
//     return true;
//   }

//   const token = localStorage.getItem('token');

//   if (
//     token &&
//     token !== 'null' &&
//     token !== 'undefined'
//   ) {
//     return true;
//   }

//   return router.createUrlTree(['/login']);
// };

import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Côté serveur
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (!token || token === 'null' || token === 'undefined') {
    return router.createUrlTree(['/login']);
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Vérifie si le token est expiré
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return router.createUrlTree(['/login']);
    }

    return true;
  } catch (error) {
    // Token invalide
    localStorage.removeItem('token');
    return router.createUrlTree(['/login']);
  }
};