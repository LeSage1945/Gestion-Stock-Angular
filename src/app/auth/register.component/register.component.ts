import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterService } from './resgister.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private registerService = inject(RegisterService);
  private router = inject(Router);

  messageErreur = '';
  loading = false;

  form = new FormGroup({
    nom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    motDePasse: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    this.messageErreur = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const data = {
      nom: this.form.value.nom!,
      email: this.form.value.email!,
      motDePasse: this.form.value.motDePasse!,
      role: 'VENDEUR' as const
    };

    console.log('Données à envoyer :', data);

    this.registerService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.messageErreur =
          err?.error?.message || 'Erreur lors de l’inscription';
      }
    });
  }
}