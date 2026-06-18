import { Observable } from 'rxjs';
import { GlobalServiceService } from './../../core/service/global-service.service';
import { inject, Injectable } from '@angular/core';
import { Iproduits } from './models/produit';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {

  private  api = inject(GlobalServiceService)

  getAllProduit(): Observable<Iproduits[]>{
    return this.api.request('produit/getAll', "GET")
  }

  createProduit(data: Iproduits): Observable<Iproduits>{
    return this.api.request('produit/create', "POST", data)
  }

  updateProduit(id: string, data: Iproduits): Observable<Iproduits>{
    return this.api.request('produit/update/' + id, "PUT", data)
  }

  deleteProduit(id: string): Observable<Iproduits>{
    return this.api.request('produit/delete/' + id, "DELETE")
  }
  
}
