import {
  Injectable,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {

    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('token');
  }

  getUser(): any {

    if (!this.isBrowser()) {
      return null;
    }

    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {

    if (this.isBrowser()) {

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('abonnement');
    }

    window.location.href = '/login';
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  getCompteId(): string | null {
    return this.getUser()?.compteId ?? null;
  }

  getUserId(): string | null {
    return this.getUser()?.id ?? null;
  }

  getAbonnement(): string {

    if (!this.isBrowser()) {
      return '';
    }

    return localStorage.getItem('abonnement') ?? '';
  }
}