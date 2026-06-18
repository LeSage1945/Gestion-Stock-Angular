import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { user } from '../users-component/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {

  private api = inject(GlobalServiceService);

  getAllUsers(): Observable<user[]> {
    return this.api.request('utilisateur/admins/global', 'GET');
  }
}
