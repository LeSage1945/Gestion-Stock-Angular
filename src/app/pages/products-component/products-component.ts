import { Component, inject, OnInit, signal } from '@angular/core';

import { ProduitService } from './produit.service';
import { Iproduits } from './models/produit';

import { GlobalServiceService } from './../../core/service/global-service.service';

import { LoaderComponent } from "../../shared/components/loader-component/loader-component";

import { MatDialog } from '@angular/material/dialog';

import { ModalProduitComponent } from './modal/modal.produit.component/modal.produit.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';

@Component({
  selector: 'app-products-component',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './products-component.html',
  styleUrl: './products-component.css',
})
export class ProductsComponent implements OnInit {

  // ===================== INJECT =====================
  private dialog = inject(MatDialog);
  private produitService = inject(ProduitService);
  public globalService = inject(GlobalServiceService);

  // ===================== SIGNALS =====================
  TitrePage = signal('📦 Gestion des Produits');
  produitListe = signal<Iproduits[]>([]);
  produitFiltre = signal<Iproduits[]>([]);
  recherche = signal('');
  isLoading = signal(true);

  // ===================== INIT =====================
  ngOnInit(): void {
    this.getAllProduits();
  }

  // ===================== GET ALL =====================
  getAllProduits(): void {
    this.isLoading.set(true);
    this.produitService.getAllProduit().subscribe({
      next: (data: Iproduits[]) => {
        this.produitListe.set(data);
        this.produitFiltre.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.globalService.alert(
          error?.error?.message || 'Erreur lors du chargement des produits',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ===================== VIEW =====================
  onView(produit: Iproduits): void {
    this.dialog.open(ModalProduitComponent, {
      width: '1000px',
      height: '550px',
      data: { action: 'view', data: produit }
    });
  }

  // ===================== CREATE =====================
  onCreate(): void {
    const dialogRef = this.dialog.open(ModalProduitComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'create', data: '' }
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (!resultat) return;

      this.isLoading.set(true);

      this.produitService.createProduit(resultat).subscribe({
        next: () => {
          this.globalService.alert(
            'Le produit a été créé avec succès.',
            'Produit créé ✅',
            'success',
            '',
            'OK'
          );
          this.getAllProduits();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.globalService.alert(
            error?.error?.message || 'Erreur lors de la création',
            'Erreur création',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== EDIT =====================
  onEdit(produit: Iproduits): void {
    const idProduit = produit.id;

    const dialogRef = this.dialog.open(ModalProduitComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'update', data: produit }
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (!resultat) return;

      this.isLoading.set(true);

      this.produitService.updateProduit(idProduit, resultat).subscribe({
        next: () => {
          this.globalService.alert(
            `Le produit "${produit.nom}" a été modifié avec succès.`,
            'Produit modifié ✅',
            'success',
            '',
            'OK'
          );
          this.getAllProduits();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.globalService.alert(
            error?.error?.message || 'Erreur lors de la modification',
            'Erreur modification',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== DELETE =====================
  onDelete(produit: Iproduits): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer produit',
        message: `Voulez-vous supprimer le produit "${produit.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading.set(true);

      this.produitService.deleteProduit(produit.id).subscribe({
        next: () => {
          this.globalService.alert(
            `Le produit "${produit.nom}" a été supprimé avec succès.`,
            'Produit supprimé ✅',
            'success',
            '',
            'OK'
          );
          this.getAllProduits();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.globalService.alert(
            error?.error?.message || 'Erreur lors de la suppression',
            'Impossible de supprimer ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== SEARCH =====================
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.recherche.set(value);
    const filtered = this.produitListe().filter(p =>
      p.nom.toLowerCase().includes(value) ||
      p.marque.toLowerCase().includes(value)
    );
    this.produitFiltre.set(filtered);
  }
}