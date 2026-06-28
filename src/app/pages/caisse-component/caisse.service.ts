import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { ISolde, IMouvementCaisse } from './model/caisse.model';

@Injectable({
  providedIn: 'root',
})
export class CaisseService {

  private api = inject(GlobalServiceService);

  getSolde(): Observable<ISolde> {
    return this.api.request<ISolde>('caisse/solde', 'GET');
  }

  getAll(): Observable<IMouvementCaisse[]> {
    return this.api.request<IMouvementCaisse[]>('caisse/all', 'GET');
  }

  addManuel(data: { type: string; montant: number; motif: string }): Observable<IMouvementCaisse> {
    return this.api.request<IMouvementCaisse>('caisse/manuel', 'POST', data);
  }

  update(id: string, dto: { montant?: number; motif?: string }): Observable<IMouvementCaisse> {
    return this.api.request<IMouvementCaisse>(`caisse/update/${id}`, 'PUT', dto);
  }

  delete(id: string): Observable<any> {
    return this.api.request(`caisse/delete/${id}`, 'DELETE');
  }
}