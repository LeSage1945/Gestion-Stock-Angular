import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { RegisterUser } from './model/model.register';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  private api = inject(GlobalServiceService);

  register(data: RegisterUser): Observable<any> {
    return this.api.request('utilisateur/create/user','POST',data);
  }
}