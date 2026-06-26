import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FournisseurService } from '../../../../fournisseur/fournisseur.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-entree-stock',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './entre.stock.component.html',
})
export class EntreStockComponent implements OnInit {

  private fournisseurService = inject(FournisseurService);
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  fournisseurs: any[] = [];
  fournisseurId: string = '';

  quantite: number = 0;
  montantTotal: number = 0; // ← montant total payé réellement

  // Prix unitaire calculé automatiquement
  get prixUnitaire(): number {
    if (!this.quantite || this.quantite <= 0) return 0;
    return Math.round(this.montantTotal / this.quantite);
  }

  ngOnInit(): void {
    this.getAllFournisseur();
  }

  getAllFournisseur() {
    this.fournisseurService.getAllFournisseur().subscribe({
      next: (data) => { this.fournisseurs = data; },
      error: (err) => { console.log(err); }
    });
  }

  save() {
    if (!this.quantite || this.quantite <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }

    if (!this.montantTotal || this.montantTotal <= 0) {
      alert("Le montant total doit être supérieur à 0");
      return;
    }

    this.dialogRef.close({
      produitId: this.data.id || this.data.produit.produitId,
      quantite: this.quantite,
      fournisseurId: this.fournisseurId,
      prixAchat: this.prixUnitaire,   // ← prix unitaire calculé
      montantTotal: this.montantTotal  // ← montant réel pour la caisse
    });
  }

  close() {
    this.dialogRef.close();
  }
}