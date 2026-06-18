import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private loginService = inject(LoginService);
  private router = inject(Router);

  // ================= ETATS =================
  loading = false;
  messageErreur = '';

  // ================= FORM =================
  userForm = new FormGroup({

    code: new FormControl('', [
      Validators.required
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  // ================= LOGIN =================
  onSubmit() {

    // reset erreur
    this.messageErreur = '';

    // validation formulaire
    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const user = {

      code: this.userForm.value.code!,
      email: this.userForm.value.email!,
      password: this.userForm.value.password!,
    };

    console.log(user);

    this.loginService.login(user).subscribe({

      next: (response) => {

        localStorage.setItem('token', response.access_token);

        localStorage.setItem('abonnement', 'ACTIF'); // 🔥 TEMPORAIRE

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        console.log(error);

        this.loading = false;

        this.messageErreur =
          error?.error?.message ||
          'Erreur de connexion';
      },
    });
  }

  // ================= GETTERS =================
  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }
}