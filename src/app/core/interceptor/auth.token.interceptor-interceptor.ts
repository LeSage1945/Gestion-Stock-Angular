import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {

  let token: string | null = null;

  if (typeof window !== 'undefined') {

    token = localStorage.getItem('token');
  }

  if (token) {

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('TOKEN ENVOYÉ');
  }

  return next(req);
};