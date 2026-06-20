import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalServiceService {

  private httpClient = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private baseUrl = environment.apiUrl;

  // 🔥 AJOUT AUTOMATIQUE DU TOKEN
  private getHeaders(customHeaders?: HttpHeaders): HttpHeaders {

    let headers = customHeaders || new HttpHeaders();

    if (typeof window !== 'undefined' && window.localStorage) {

      const token = window.localStorage.getItem('token');

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // 🔥 GESTION CENTRALISÉE DES ERREURS
  private handleError(error: any) {
    let message = 'Une erreur est survenue, veuillez réessayer';

    if (error?.error?.message) {
      message = Array.isArray(error.error.message)
        ? error.error.message.join('\n')
        : error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    if (typeof window !== 'undefined') {
      alert(message);
    }

    return throwError(() => error);
  }

  request<T>(
    url: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PUT',
    data?: any,
    headers?: HttpHeaders
  ) {

    const fullUrl = `${this.baseUrl}${url}`;

    const finalHeaders = this.getHeaders(headers);

    switch (method) {

      case 'GET':
        return this.httpClient.get<T>(fullUrl, {
          headers: finalHeaders
        }).pipe(catchError((error) => this.handleError(error)));

      case 'POST':
        return this.httpClient.post<T>(
          fullUrl,
          data,
          {
            headers: finalHeaders
          }
        ).pipe(catchError((error) => this.handleError(error)));

      case 'PUT':
        return this.httpClient.put<T>(
          fullUrl,
          data,
          {
            headers: finalHeaders
          }
        ).pipe(catchError((error) => this.handleError(error)));

      case 'DELETE':
        return this.httpClient.delete<T>(
          fullUrl,
          {
            headers: finalHeaders
          }
        ).pipe(catchError((error) => this.handleError(error)));

      default:
        throw new Error('Méthode HTTP non supportée');
    }
  }

  formatDate(
    date: string | Date,
    separator: string = '/'
  ): string {

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}${separator}${month}${separator}${year}`;
  }
}