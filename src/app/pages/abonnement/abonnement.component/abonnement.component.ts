import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbonnementService } from '../abonnement.service';
import { CompteService } from '../../compte-component/compte.service';
import { forkJoin } from 'rxjs';
import { ActivationComponent } from '../activation.component/activation.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './abonnement.component.html',
  styleUrl: './abonnement.component.css'
})
export class AbonnementComponent implements OnInit {
  private abonnementService = inject(AbonnementService);
  private compteService = inject(CompteService);
  private dialog = inject(MatDialog); // Injection d'Angular Material Dialog

  comptes = signal<any[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  // ================= LOAD DATA (COMPTES + ABONNEMENTS) =================
  loadData() {
    this.loading.set(true);

    // On lance les deux requêtes en parallèle
    forkJoin({
      comptes: this.compteService.getAllCompte(),
      abonnements: this.abonnementService.getAllAbonnements()
    }).subscribe({
      next: ({ comptes, abonnements }) => {
        // On associe à chaque compte son abonnement correspondant
        const comptesRemplis = comptes.map((compte: any) => {
          const abo = abonnements.find((a: any) => a.compteId === compte.id);
          return {
            ...compte,
            abonnement: abo || null // null si aucun abonnement en BDD
          };
        });

        this.comptes.set(comptesRemplis);
      },
      error: (err) => console.error('Erreur de chargement', err),
      complete: () => this.loading.set(false)
    });
  }

  // ================= ACTIVER ABONNEMENT =================
  activer(compteId: string) {
    // 1. Ouvrir le composant enfant via Angular Material
    const dialogRef = this.dialog.open(ActivationComponent, {
      width: '500px',
      disableClose: true, // Évite de fermer en cliquant à côté (équivalent de backdrop static)
      panelClass: 'custom-dialog-container' // Optionnel: pour appliquer des styles personnalisés
    });

    // 2. Récupérer la durée après la fermeture du dialog
    dialogRef.afterClosed().subscribe((duree: number | null) => {
      // Si l'utilisateur a validé et fourni une durée valide
      if (duree && duree > 0) {
        this.loading.set(true);

        this.abonnementService.activer(compteId, duree).subscribe({
          next: () => {
            this.loadData(); // Recharge le tableau automatiquement
          },
          error: (err) => {
            console.error(err);
            this.loading.set(false);
          }
        });
      }
    });
  }

  // ================= DÉSACTIVER ABONNEMENT =================
  desactiver(compteId: string) {
    this.loading.set(true);

    this.abonnementService.desactiver(compteId).subscribe({
      next: () => {
        this.loadData(); // Recharge le tableau automatiquement
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}