import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { GlobalServiceService } from './../../core/service/global-service.service';
import { user } from './model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private api = inject(GlobalServiceService);

  // ================= GET ALL =================
  getAllUsers(): Observable<user[]> {
    return this.api.request('utilisateur/getAll/user', 'GET');
  }

  // ================= CREATE =================
  createUser(data: Partial<user>): Observable<user> {
    return this.api.request('utilisateur/create/user', 'POST', data);
  }

  createWithAccount(data: any, compte: any): Observable<user> {
    return this.api.request(
      'utilisateur/create/user/compte',
      'POST',
      { data, compte }
    );
  }


  // ================= DELETE =================
  deleteUser(id: string): Observable<any> {
    console.log(id)
    return this.api.request(`utilisateur/delete/user/${id}`, 'DELETE');
  }

  // ================= UPDATE =================
  updateUser(id: string, data: Partial<user>): Observable<user> {
    return this.api.request(`utilisateur/update/user/${id}`, 'PUT', data);
  }
}