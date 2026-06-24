import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SalesService } from './sales.service';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { MatDialog } from '@angular/material/dialog';
import { NouvelleVentComponent } from './modal/nouvelle-vent.component/nouvelle-vent.component';
import { ProduitService } from '../products-component/produit.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';
import { LoaderComponent } from "../../shared/components/loader-component/loader-component";

@Component({
  selector: 'app-sales-component',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './sales-component.html',
  styleUrl: './sales-component.css',
})
export class SalesComponent implements OnInit {

  // ===================== INJECT =====================
  private venteService = inject(SalesService);
  private produitservice = inject(ProduitService);
  private dialog = inject(MatDialog);
  public globalService = inject(GlobalServiceService);

  // ===================== SIGNALS =====================
  ventes = signal<any[]>([]);
  produit = signal<any[]>([]);
  search = signal('');
  isLoading = signal(true);

  // ===================== COMPUTED STATS =====================
  ventesJour = computed(() => {
    const today = new Date().toDateString();
    return this.ventes().filter(v =>
      new Date(v.creeLe).toDateString() === today
    ).length;
  });

  chiffreJour = computed(() => {
    const today = new Date().toDateString();
    return this.ventes()
      .filter(v => new Date(v.creeLe).toDateString() === today)
      .reduce((sum, v) => sum + Number(v.montantTotal), 0);
  });

  produitsVendus = computed(() => {
    const today = new Date().toDateString();
    return this.ventes()
      .filter(v => new Date(v.creeLe).toDateString() === today)
      .reduce((sum, v) => sum + (v.lignes?.length || 0), 0);
  });

  // ===================== INIT =====================
  ngOnInit(): void {
    this.loadVentes();
    this.getAllProduit();
  }

  // ===================== LOAD VENTES =====================
  loadVentes(): void {
    this.isLoading.set(true);
    this.venteService.getAllVente().subscribe({
      next: (res: any[]) => {
        this.ventes.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des ventes',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ===================== LOAD PRODUITS =====================
  getAllProduit(): void {
    this.produitservice.getAllProduit().subscribe({
      next: (data: any[]) => {
        this.produit.set(data);
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des produits',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ===================== AJOUTER VENTE =====================
  onAddVente(): void {
    const dialogRef = this.dialog.open(NouvelleVentComponent, {
      width: '50vw',
      maxWidth: '1200px',
      height: '85vh',
      panelClass: 'vente-dialog',
      data: {
        mode: 'create',
        data: this.produit()
      }
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (!resultat) return;

      this.isLoading.set(true);

      this.venteService.newVente(resultat).subscribe({
        next: () => {
          this.globalService.alert(
            'La vente a été enregistrée avec succès.',
            'Vente créée ✅',
            'success',
            '',
            'OK'
          );
          this.loadVentes();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la création de la vente',
            'Erreur vente ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== DELETE =====================
  annulerVente(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer vente',
        message: 'Voulez-vous supprimer cette vente ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading.set(true);

      this.venteService.deleteVente(id).subscribe({
        next: () => {
          this.globalService.alert(
            'La vente a été supprimée avec succès.',
            'Vente supprimée ✅',
            'success',
            '',
            'OK'
          );
          this.loadVentes();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression de la vente',
            'Erreur suppression ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }
}