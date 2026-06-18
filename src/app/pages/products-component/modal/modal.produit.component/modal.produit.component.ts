import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalUserComponent } from '../../../users-component/modal-user-component/modal-user-component';

@Component({
  selector: 'app-modal.produit.component',
  imports: [ReactiveFormsModule],
  templateUrl: './modal.produit.component.html',
  styleUrl: './modal.produit.component.css',
})
export class ModalProduitComponent {

  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ModalUserComponent>);

  produitForm = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    marque: new FormControl('', [Validators.required]),
    prix: new FormControl('', [Validators.required]),
    seuilAlerte: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    if (this.data.data) {
      this.produitForm.patchValue(this.data.data)

      if (this.data.action === 'view') {
        this.produitForm.disable();
      }

      if (this.data.action === 'update') {
        console.log("update")
      }
    }
  }

  onSubmit() {
    if (this.produitForm.invalid) {
      console.log('Formulaire invalide');
      return;
    }

    const produit = this.produitForm.value

    console.log(produit)
    this.dialogRef.close(produit)
  }

  close() {
    this.dialogRef.close(); // rien envoyé
  }
}
