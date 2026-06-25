import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbonnementService } from '../abonnement.service';
import { CompteService } from '../../compte-component/compte.service';
import { GlobalServiceService } from '../../../core/service/global-service.service';
import { forkJoin } from 'rxjs';
import { ActivationComponent } from '../activation.component/activation.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { LoaderComponent } from '../../../shared/components/loader-component/loader-component';

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './abonnement.component.html',
  styleUrl: './abonnement.component.css'
})
export class AbonnementComponent implements OnInit {

  private abonnementService = inject(AbonnementService);
  private compteService = inject(CompteService);
  private globalService = inject(GlobalServiceService);
  private dialog = inject(MatDialog);

  comptes = signal<any[]>([]);
  loading = signal(true);

  // ===================== STATS =====================
  totalComptes = computed(() => this.comptes().length);

  totalActifs = computed(() =>
    this.comptes().filter(c => c.abonnement?.statut === 'ACTIF').length
  );

  totalInactifs = computed(() =>
    this.comptes().filter(c => c.abonnement?.statut !== 'ACTIF').length
  );

  ngOnInit() {
    this.loadData();
  }

  // ================= LOAD DATA =================
  loadData() {
    this.loading.set(true);

    forkJoin({
      comptes: this.compteService.getAllCompte(),
      abonnements: this.abonnementService.getAllAbonnements()
    }).subscribe({
      next: ({ comptes, abonnements }) => {
        const comptesRemplis = comptes.map((compte: any) => {
          const abo = abonnements.find((a: any) => a.compteId === compte.id);
          return { ...compte, abonnement: abo || null };
        });
        this.comptes.set(comptesRemplis);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des données',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= ACTIVER =================
  activer(compteId: string) {
    const dialogRef = this.dialog.open(ActivationComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((duree: number | null) => {
      if (!duree || duree <= 0) return;

      this.loading.set(true);

      this.abonnementService.activer(compteId, duree).subscribe({
        next: () => {
          this.globalService.alert(
            `L'abonnement a été activé avec succès pour ${duree} mois.`,
            'Abonnement activé ✅',
            'success',
            '',
            'OK'
          );
          this.loadData();
        },
        error: (err) => {
          this.loading.set(false);
          this.globalService.alert(
            err?.error?.message || "Erreur lors de l'activation de l'abonnement",
            "Erreur activation ❌",
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ================= DÉSACTIVER =================
  desactiver(compteId: string) {
    const compte = this.comptes().find(c => c.id === compteId);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Désactiver abonnement',
        message: `Voulez-vous désactiver l'abonnement du compte "${compte?.nom || compteId}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading.set(true);

      this.abonnementService.desactiver(compteId).subscribe({
        next: () => {
          this.globalService.alert(
            `L'abonnement du compte "${compte?.nom || ''}" a été désactivé avec succès.`,
            'Abonnement désactivé ✅',
            'success',
            '',
            'OK'
          );
          this.loadData();
        },
        error: (err) => {
          this.loading.set(false);
          this.globalService.alert(
            err?.error?.message || "Erreur lors de la désactivation de l'abonnement",
            'Erreur désactivation ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }
}