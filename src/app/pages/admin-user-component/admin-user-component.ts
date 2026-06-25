import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompteService } from '../compte-component/compte.service';
import { ICompte } from '../compte-component/model/compte.model';
import { UserService } from '../users-component/user.service';
import { AdminUserService } from './admin-user.service';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';
import { LoaderComponent } from '../../shared/components/loader-component/loader-component';

@Component({
  selector: 'app-admin-user-component',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './admin-user-component.html',
  styleUrl: './admin-user-component.css',
})
export class AdminUserComponent implements OnInit {

  private utilisateurService = inject(UserService);
  private AdminUserService = inject(AdminUserService);
  private compteService = inject(CompteService);
  private globalService = inject(GlobalServiceService);
  private dialog = inject(MatDialog);

  utilisateurs = signal<any[]>([]);
  comptes = signal<ICompte[]>([]);
  selectedCompteId = signal<string>('');
  erreurs = signal<Record<string, string>>({});
  isLoading = signal(true);

  userForm = signal({
    nom: '',
    email: '',
    motDePasse: '',
    role: 'ADMIN'
  });

  // ===================== STATS =====================
  totalAdmins = computed(() => this.utilisateurs().length);

  totalParCompte = computed(() => {
    const map = new Map<string, number>();
    this.utilisateurs().forEach(u => {
      const nom = u.compteNom || 'Aucun compte';
      map.set(nom, (map.get(nom) || 0) + 1);
    });
    return map.size;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ================= LOAD =================
  loadInitialData(): void {
    this.isLoading.set(true);

    this.compteService.getAllCompte().subscribe({
      next: (res) => this.comptes.set(res),
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des comptes',
          'Erreur', 'danger', '', 'OK'
        );
      }
    });

    this.AdminUserService.getAllUsers().subscribe({
      next: (res) => {
        this.utilisateurs.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des utilisateurs',
          'Erreur', 'danger', '', 'OK'
        );
      }
    });
  }

  // ================= VALIDATION =================
  updateField(field: string, value: string): void {
    this.userForm.update(state => ({ ...state, [field]: value }));
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

  // ================= CREATE =================
  createUserWithAccount(): void {
    if (!this.validerTout()) return;

    this.utilisateurService.createWithAccount(this.userForm(), this.selectedCompteId()).subscribe({
      next: () => {
        this.globalService.alert(
          `L'administrateur "${this.userForm().nom}" a été créé et affecté avec succès.`,
          'Administrateur créé ✅', 'success', '', 'OK'
        );
        this.userForm.set({ nom: '', email: '', motDePasse: '', role: 'ADMIN' });
        this.selectedCompteId.set('');
        this.erreurs.set({});
        this.loadInitialData();
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors de la création',
          'Erreur création ❌', 'danger', '', 'OK'
        );
      }
    });
  }

  // ================= DELETE =================
  deleteUser(id: string): void {
    const user = this.utilisateurs().find(u => u.id === id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer administrateur',
        message: `Voulez-vous supprimer "${user?.nom || 'cet administrateur'}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.utilisateurService.deleteUser(id).subscribe({
        next: () => {
          this.globalService.alert(
            'L\'administrateur a été supprimé avec succès.',
            'Supprimé ✅', 'success', '', 'OK'
          );
          this.loadInitialData();
        },
        error: (err) => {
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression',
            'Erreur suppression ❌', 'danger', '', 'OK'
          );
        }
      });
    });
  }
}