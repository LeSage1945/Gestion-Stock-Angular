import { Component, inject, signal } from '@angular/core';
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
export class AdminUserComponent {
  private utilisateurService = inject(UserService);
  private AdminUserService = inject(AdminUserService);
  private compteService = inject(CompteService);

  utilisateurs = signal<any[]>([]); // Liste des admins
  comptes = signal<ICompte[]>([]);  // Liste des comptes pour le Select

  // ID du compte sélectionné dans le Dropdown
  selectedCompteId = signal<string>('');

  // Objet DTO pour le formulaire
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
    // 1. Charger les comptes pour remplir le Select
    this.compteService.getAllCompte().subscribe({
      next: (res) => this.comptes.set(res),
      error: (err) => console.error(err)
    });

    // 2. Charger les utilisateurs pour le tableau
    this.AdminUserService.getAllUsers().subscribe({
      next: (res) => this.utilisateurs.set(res),
      error: (err) => console.error(err)
    });
  }

  updateField(field: string, value: string): void {
    this.userForm.update(state => ({ ...state, [field]: value }));
  }

  createUserWithAccount(): void {
    const dto = this.userForm();
    const compteId = this.selectedCompteId();

    if (!dto.nom || !dto.email || !dto.motDePasse || !compteId) {
      alert('Veuillez remplir tous les champs et sélectionner un compte.');
      return;
    }

    this.utilisateurService.createWithAccount(dto, compteId).subscribe({
      next: () => {
        alert('Utilisateur ADMIN créé avec succès !');
        this.loadInitialData();
        this.userForm.set({
          nom: '',
          email: '',
          motDePasse: '',
          role: 'ADMIN'
        });
        this.selectedCompteId.set('');
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
