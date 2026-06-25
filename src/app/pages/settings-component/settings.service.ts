import { inject, Injectable } from '@angular/core';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(GlobalServiceService);

  updateProfile(id: string, data: { nom: string; email: string }): Observable<any> {
    return this.api.request(`utilisateur/update/user/${id}`, 'PUT', data);
  }

  updatePassword(id: string, data: { motDePasse: string }): Observable<any> {
    return this.api.request(`utilisateur/update/user/${id}`, 'PUT', data);
  }
}