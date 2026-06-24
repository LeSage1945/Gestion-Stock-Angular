import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../alert-component/alert-component';

@Injectable({
  providedIn: 'root',
})
export class GlobalServiceService {

  private httpClient = inject(HttpClient);
  private dialog = inject(MatDialog)

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
        ? error.error.message.join('<br>')
        : error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    // ✅ remplace alert() natif par ta dialog
    this.alert(message, 'Erreur', 'danger', '', 'OK');

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

  // alert(msg: string, title: string, type: "info" | "success" | "danger", btnCancel: string, btnOk: string, disableClose: boolean = false) {
  //   const ref = this.dialog.open(AlertComponent, {
  //     maxWidth: '500px',
  //     disableClose: disableClose,
  //     data: {
  //       content: msg,
  //       type: type,
  //       buttonCancelName: btnCancel,
  //       buttonOKName: btnOk,
  //       title: title,
  //     }
  //   });
  //   return ref;
  // }

  alert(
    msg: string,
    title: string,
    type: 'info' | 'success' | 'danger',
    btnCancel: string = '',
    btnOk: string = 'OK',
    disableClose: boolean = false
  ) {
    const ref = this.dialog.open(AlertComponent, {
      maxWidth: '500px',
      disableClose: disableClose,
      data: {
        content: msg,
        type: type,
        buttonCancelName: type === 'success' ? '' : btnCancel,
        buttonOKName: type === 'success' ? '' : btnOk,  // ✅ pas de bouton si success
        title: title,
      }
    });

    // ✅ auto-fermeture après 2.5s si success
    if (type === 'success') {
      setTimeout(() => ref.close(), 1500);
    }

    return ref;
  }
}