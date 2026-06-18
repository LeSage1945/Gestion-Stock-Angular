import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-sortie-stock',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sortie.stock.component.html',
})
export class SortieStockComponent implements OnInit{

  // 📦 données reçues du parent
  data = inject(MAT_DIALOG_DATA);

  // 🔒 fermer modal
  dialogRef = inject(MatDialogRef);

  // champs formulaire
  quantite: number = 0;
  raison: string = '';

  ngOnInit(): void {
    console.log(this.data)
  }

  // 📤 validation sortie
  save() {

    if (!this.quantite || this.quantite <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }

    if (!this.raison || this.raison.trim() === '') {
      alert("La raison est obligatoire");
      return;
    }

    // renvoyer les données au composant parent
    this.dialogRef.close({
      produitId: this.data.produitId,
      quantite: this.quantite,
      raison: this.raison
    });
  }

  // ❌ fermer sans action
  close() {
    this.dialogRef.close();
  }
}




