import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { ICompte } from './model/compte.model';

@Injectable({
  providedIn: 'root',
})
export class CompteService {

  private api = inject(GlobalServiceService);

  // ================= GET ALL =================
  getAllCompte(): Observable<ICompte[]> {
    return this.api.request<ICompte[]>(
      'comptes',
      'GET'
    );
  }

  // ================= CREATE =================
  createCompte(data: ICompte): Observable<ICompte> {
    return this.api.request<ICompte>(
      'comptes',
      'POST',
      data
    );
  }

  // ================= UPDATE =================
  updateCompte(id: string, data: ICompte): Observable<ICompte> {
    return this.api.request<ICompte>(
      'comptes/' + id,
      'PUT',
      data
    );
  }

  // ================= GET ONE =================
  getOneCompte(id: string): Observable<ICompte> {
    return this.api.request<ICompte>(
      'comptes/' + id,
      'GET'
    );
  }

  // ================= DELETE =================
  deleteCompte(id: string): Observable<ICompte> {
    return this.api.request<ICompte>(
      'comptes/' + id,
      'DELETE'
    );
  }
}