import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FournisseurService } from '../../../../fournisseur/fournisseur.service';

@Component({
  selector: 'app-modal-entree-stock',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entre.stock.component.html',
})
export class EntreStockComponent implements OnInit {

  private fournisseurService = inject(FournisseurService)

  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);
  fournisseurId: string = '';
  fournisseurs: any[] = [];

  ngOnInit(): void {
    console.log(this.data)
    this.getAllFournisseur()
  }

  getAllFournisseur() {
    this.fournisseurService.getAllFournisseur().subscribe({
      next: (data) => {
        this.fournisseurs = data
        console.log(this.fournisseurs)
      },
      error: (erreor) => {
        console.log(erreor)
      }
    })
  }

  // champs formulaire
  quantite: number = 0;
  prixAchat: number = 0;

  save() {

    if (!this.quantite || this.quantite <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }

    if (!this.prixAchat || this.prixAchat <= 0) {
      alert("Le prix d'achat doit être supérieur à 0");
      return;
    }

    console.log(this.data.produit.produitId)
    this.dialogRef.close({
      produitId: this.data.id || this.data.produit.produitId,
      quantite: this.quantite,
      fournisseurId: this.fournisseurId, // 🔥 OBLIGATOIRE
      prixAchat: this.prixAchat
    });
  }

  // ❌ fermer modal sans action
  close() {
    this.dialogRef.close();
  }
}