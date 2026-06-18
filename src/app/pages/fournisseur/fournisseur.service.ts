import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { Ifournisseur } from './fournisseur.model';

@Injectable({
  providedIn: 'root',
})
export class FournisseurService {
  private api = inject(GlobalServiceService)


  // récupérer tous les stocks (produits avec stock calculé)
  getAllFournisseur(): Observable<Ifournisseur[]> {
    return this.api.request<Ifournisseur[]>('fournisseur/getAll', "GET");
  }

  createFournisseur(data: Ifournisseur): Observable<Ifournisseur> {
    return this.api.request<Ifournisseur>('fournisseur/create', "POST", data);
  }

  updateFournisseur(id: string, data: Ifournisseur): Observable<Ifournisseur> {
    return this.api.request<Ifournisseur>('fournisseur/update/' + id, "PUT", data);
  }

  getOneFournisseur(id: string): Observable<Ifournisseur> {
    return this.api.request<Ifournisseur>('fournisseur/getOne/' + id, "GET");
  }

  deleteFournisseur(id: string): Observable<Ifournisseur> {
    return this.api.request<Ifournisseur>('fournisseur/delete/' + id, "DELETE");
  }
}
