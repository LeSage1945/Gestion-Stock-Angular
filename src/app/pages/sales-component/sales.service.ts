import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { GlobalServiceService } from '../../core/service/global-service.service';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private api = inject(GlobalServiceService)

  getAllVente(): Observable<any[]> {
    return this.api.request('vente/all', 'GET')
  }

  newVente(data: any): Observable<any[]> {
    return this.api.request('vente/create', 'POST', data)
  }

  deleteVente(id: string) {
    return this.api.request('vente/delete/' + id, 'DELETE', id)

  }
}
