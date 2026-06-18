import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';

import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptor/auth.token.interceptor-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideHttpClient(
      withFetch(),
      withInterceptors([authTokenInterceptor])
    ),

    provideRouter(routes),

    provideClientHydration(
      withEventReplay()
    ),
  ]
};