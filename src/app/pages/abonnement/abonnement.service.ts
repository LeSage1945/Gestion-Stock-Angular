import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalServiceService } from '../../core/service/global-service.service';

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private api = inject(GlobalServiceService);

  // Récupérer tous les abonnements pour pouvoir faire le croisement
  getAllAbonnements(): Observable<any[]> {
    return this.api.request<any[]>('abonnement/getAllAbonnements', 'GET');
  }

  // Activer l'abonnement d'un compte spécifique
  activer(compteId: string, dureeJours: number = 30): Observable<any> {
    return this.api.request(
      `abonnement/activer/${compteId}`,
      'POST',
      { dureeJours }
    );
  }

  // ================= DÉSACTIVER UN ABONNEMENT =================
  desactiver(compteId: string): Observable<any> {
    return this.api.request(
      `abonnement/desactiver/${compteId}`, // Assure-toi que ton backend possède cet endpoint
      'POST'
    );
  }
}