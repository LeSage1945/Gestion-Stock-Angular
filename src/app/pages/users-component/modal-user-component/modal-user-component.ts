import { user } from './../model/user.model';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-user-component',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-user-component.html',
  styleUrl: './modal-user-component.css',
})
export class ModalUserComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ModalUserComponent>);


  userForm = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    motDePasse: new FormControl('', [Validators.minLength(6)]),
    role: new FormControl('CAISSIER', [Validators.required]),
    active: new FormControl(true)
  })

  ngOnInit(): void {
    if (this.data.data) {
      this.userForm.patchValue(this.data.data)

      if (this.data.action === 'view') {
         this.userForm.disable();
      }

      if (this.data.action === 'update') {
        console.log("creer")
      }
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      console.log('Formulaire invalide');
      return;
    }

    console.log('Utilisateur :', this.userForm.value);

    const user = this.userForm.value
    this.dialogRef.close(user)
  }

  close() {
    this.dialogRef.close(); // rien envoyé
  }
}
