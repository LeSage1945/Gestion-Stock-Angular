import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FournisseurService } from '../../../fournisseur/fournisseur.service';

@Component({
  selector: 'app-alertmodal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './alertmodal.component.html',
  styleUrl: './alertmodal.component.css',
})
export class AlertmodalComponent implements OnInit {

  private fournisseurService = inject(FournisseurService);
  private dialogRef = inject(MatDialogRef<AlertmodalComponent>);

  data = inject(MAT_DIALOG_DATA);

  // 📦 données fournisseurs
  fournisseurs: any[] = [];

  // 🧾 champs formulaire
  fournisseurId: string = '';
  quantite: number = 0;
  prixAchat: number = 0;

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  // 📥 charger fournisseurs
  loadFournisseurs() {
    this.fournisseurService.getAllFournisseur().subscribe({
      next: (data) => {
        this.fournisseurs = data;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  // 💾 validation réapprovisionnement
  save() {

    if (!this.fournisseurId) {
      alert("Veuillez choisir un fournisseur");
      return;
    }

    if (!this.quantite || this.quantite <= 0) {
      alert("Quantité invalide");
      return;
    }

    if (!this.prixAchat || this.prixAchat <= 0) {
      alert("Prix invalide");
      return;
    }

    this.dialogRef.close({
      produitId: this.data.produit.id || this.data.produit.produitId,
      fournisseurId: this.fournisseurId,
      quantite: this.quantite,
      prixAchat: this.prixAchat
    });
  }

  // ❌ fermer modal
  close() {
    this.dialogRef.close();
  }
}