import { Component, inject, OnInit, signal } from '@angular/core';
import { CompteService } from '../compte-component/compte.service';
import { ICompte } from '../compte-component/model/compte.model';
import { UserService } from '../users-component/user.service';
import { AdminUserService } from './admin-user.service';

@Component({
  selector: 'app-admin-user-component',
  imports: [],
  templateUrl: './admin-user-component.html',
  styleUrl: './admin-user-component.css',
})
export class AdminUserComponent implements OnInit {
  private utilisateurService = inject(UserService);
  private AdminUserService = inject(AdminUserService);
  private compteService = inject(CompteService);

  utilisateurs = signal<any[]>([]);
  comptes = signal<ICompte[]>([]);
  selectedCompteId = signal<string>('');
  erreurs = signal<Record<string, string>>({});

  userForm = signal({
    nom: '',
    email: '',
    motDePasse: '',
    role: 'ADMIN'
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.compteService.getAllCompte().subscribe({
      next: (res) => this.comptes.set(res),
      error: (err) => console.error(err)
    });
    this.AdminUserService.getAllUsers().subscribe({
      next: (res) => this.utilisateurs.set(res),
      error: (err) => console.error(err)
    });
  }

  updateField(field: string, value: string): void {
    this.userForm.update(state => ({ ...state, [field]: value }));
    // Valider le champ en temps réel
    this.validerChamp(field, value);
  }

  validerChamp(field: string, value: string): void {
    const errs = { ...this.erreurs() };

    if (field === 'nom') {
      if (!value.trim()) errs['nom'] = 'Le nom est obligatoire';
      else if (value.length > 50) errs['nom'] = 'Maximum 50 caractères';
      else delete errs['nom'];
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) errs['email'] = "L'email est obligatoire";
      else if (!emailRegex.test(value)) errs['email'] = 'Email invalide';
      else delete errs['email'];
    }

    if (field === 'motDePasse') {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
      if (!value) errs['motDePasse'] = 'Le mot de passe est obligatoire';
      else if (value.length < 6) errs['motDePasse'] = 'Minimum 6 caractères';
      else if (!passwordRegex.test(value)) errs['motDePasse'] = 'Doit contenir au moins une lettre et un chiffre';
      else delete errs['motDePasse'];
    }

    this.erreurs.set(errs);
  }

  private validerTout(): boolean {
    const f = this.userForm();
    this.validerChamp('nom', f.nom);
    this.validerChamp('email', f.email);
    this.validerChamp('motDePasse', f.motDePasse);

    if (!this.selectedCompteId()) {
      this.erreurs.update(e => ({ ...e, compte: 'Veuillez sélectionner un compte' }));
    } else {
      this.erreurs.update(e => { const { compte, ...rest } = e; return rest; });
    }

    return Object.keys(this.erreurs()).length === 0;
  }

  createUserWithAccount(): void {
    if (!this.validerTout()) return;

    this.utilisateurService.createWithAccount(this.userForm(), this.selectedCompteId()).subscribe({
      next: () => {
        this.userForm.set({ nom: '', email: '', motDePasse: '', role: 'ADMIN' });
        this.selectedCompteId.set('');
        this.erreurs.set({});
        this.loadInitialData();
      },
      error: (err) => console.error(err)
    });
  }

  deleteUser(id: string): void {
    if (confirm('Supprimer cet administrateur ?')) {
      this.utilisateurService.deleteUser(id).subscribe({
        next: () => this.loadInitialData(),
        error: (err) => console.error(err)
      });
    }
  }
}