import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from 'express';

@Component({
  selector: 'app-reinitialisation-password.component',
  imports: [ReactiveFormsModule],
  templateUrl: './reinitialisation-password.component.html',
  styleUrl: './reinitialisation-password.component.css',
})
export class ReinitialisationPasswordComponent {
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  loading = false;
  message = '';

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    const email = this.form.value.email;

    // 👉 ICI tu vas appeler ton backend
    setTimeout(() => {
      this.loading = false;
      this.message = "Un lien de réinitialisation a été envoyé à votre email";
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
