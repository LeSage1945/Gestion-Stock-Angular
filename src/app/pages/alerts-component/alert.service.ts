import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { Ifournisseur } from '../fournisseur/fournisseur.model';
import { Ialert } from './model/Ialert';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private api = inject(GlobalServiceService)


  // récupérer tous les stocks (produits avec stock calculé)
  getAllAlert(): Observable<Ialert[]> {
    return this.api.request<Ialert[]>('alert/get/All', "GET");
  }

  createAlert(data: Ialert): Observable<Ialert> {
    return this.api.request<Ialert>('alert/create', "POST", data);
  }

  updateAlert(id: string, data: Ifournisseur): Observable<Ialert> {
    return this.api.request<Ialert>('alert/update/' + id, "PUT", data);
  }

  getOneAlert(id: string): Observable<Ialert> {
    return this.api.request<Ialert>('alert/get/one/' + id, "GET");
  }

  deleteAlert(id: string): Observable<Ialert> {
    return this.api.request<Ialert>('alert/delete/' + id, "DELETE");
  }
}
