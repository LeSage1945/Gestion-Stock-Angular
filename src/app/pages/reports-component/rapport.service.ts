import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';

export interface LigneVente {
  id: string;
  produitId: string;
  quantite: number;
  prix: number;
  produit: { id: string; nom: string; marque: string };
}

export interface Vente {
  id: string;
  montantTotal: number;
  creeLe: string;
  utilisateur: { nom: string };
  lignes: LigneVente[];
  paiements: { montant: number; methodePaiement: string }[];
}

export interface StockProduit {
  produitId: string;
  nom: string;
  marque: string;
  stockActuel: number;
  seuilAlerte: number;
  entrees: number;
  sorties: number;
  ventes: number;
}

export interface RapportStats {
  totalProduitsVendus: number;
  chiffreAffaires: number;
  stockRestant: number;
  nombreAlertes: number;
}

@Injectable({
  providedIn: 'root',
})
export class RapportService {
  private api = inject(GlobalServiceService);

  getAllVentes(): Observable<Vente[]> {
    return this.api.request<Vente[]>('vente/all', 'GET');
  }

  getAllStocks(): Observable<StockProduit[]> {
    return this.api.request<StockProduit[]>('stock/All', 'GET');
  }

  getRapportStats(): Observable<RapportStats> {
    return forkJoin({
      ventes: this.getAllVentes(),
      stocks: this.getAllStocks(),
    }).pipe(
      map(({ ventes, stocks }) => {
        const totalProduitsVendus = ventes.reduce(
          (sum, v) => sum + v.lignes.reduce((s, l) => s + l.quantite, 0),
          0
        );

        const chiffreAffaires = ventes.reduce(
          (sum, v) => sum + v.montantTotal,
          0
        );

        const stockRestant = stocks.reduce(
          (sum, s) => sum + s.stockActuel,
          0
        );

        const nombreAlertes = stocks.filter(
          (s) => s.stockActuel <= s.seuilAlerte
        ).length;

        return { totalProduitsVendus, chiffreAffaires, stockRestant, nombreAlertes };
      })
    );
  }
}