import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalUserComponent } from '../../../users-component/modal-user-component/modal-user-component';

@Component({
  selector: 'app-fournisseur.modal.component',
  imports: [ReactiveFormsModule],
  templateUrl: './fournisseur.modal.component.html',
  styleUrl: './fournisseur.modal.component.css',
})
export class FournisseurModalComponent {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ModalUserComponent>);

  fournisseurForm = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    adresse: new FormControl('', [Validators.required]),
    telephone: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    console.log("coucou")
    console.log(this.data)
    if (this.data.data) {
      this.fournisseurForm.patchValue(this.data.data)

      if (this.data.action === 'view') {
        this.fournisseurForm.disable();
      }

      if (this.data.action === 'update') {
        console.log("update")
      }
    }
  }

  onSubmit() {
    if (this.fournisseurForm.invalid) {
      console.log('Formulaire invalide');
      return;
    }

    const fournisseur = this.fournisseurForm.value

    console.log(fournisseur)
    this.dialogRef.close(fournisseur)
  }

  close() {
    this.dialogRef.close(); // rien envoyé
  }
}
