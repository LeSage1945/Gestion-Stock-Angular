import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-detail-produit',
  standalone: true,
  templateUrl: './detail.produit.component.html',
})
export class DetailProduitComponent {

  // 📦 données produit reçues
  data = inject(MAT_DIALOG_DATA);

  // 🔒 fermeture modal
  dialogRef = inject(MatDialogRef);

  // ❌ fermer modal
  close() {
    this.dialogRef.close();
  }
}