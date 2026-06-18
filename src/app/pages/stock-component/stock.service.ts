import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { Observable } from 'rxjs';
import { IStock } from './model/Istock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private api = inject(GlobalServiceService)


  // récupérer tous les stocks (produits avec stock calculé)
  getAllStocks(): Observable<IStock[]> {
    return this.api.request<IStock[]>('stock/All', "GET");
  }

  // entrée stock
  addEntree(data: any) {
    return this.api.request('stock/entree', "POST", data);
  }

  // sortie stock
  addSortie(data: any) {
    return this.api.request('stock/sortie', "POST", data);
  }

  // stock d’un produit
  getStockByProduit(id: string) {
    return this.api.request('stock/produit/' + id, "GET");
  }

  // liste entrées
  getEntrees() {
    return this.api.request('stock/liste/entrees', "GET");
  }

  // liste sorties
  getSorties() {
    return this.api.request('stock/liste/sorties', "GET");
  }

  // supprimer entrée
  deleteEntree(id: string) {
    return this.api.request('stock/entree/' + id, "DELETE");
  }

  // supprimer sortie
  deleteSortie(id: string) {
    return this.api.request('stock/sortie/' + id, "DELETE");
  }
}