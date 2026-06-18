import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private api = inject(GlobalServiceService);

  login(data: { code: string; email: string; password: string }): Observable<any> {

    return this.api.request('auth/connexion', 'POST', data).pipe(
      tap((result: any) => {

        console.log('LOGIN RESPONSE:', result);

        // 🔐 stockage token
        localStorage.setItem('token', result.access_token);

        // 👤 stockage user
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      })
    );
  }
}