import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from './settings.service';
import { GlobalServiceService } from '../../core/service/global-service.service';

type ProfileForm = {
  nom: string;
  email: string;
};

type PasswordForm = {
  motDePasse: string;
  confirmation: string;
};

type ApparenceForm = {
  theme: string;
  langue: string;
};

@Component({
  selector: 'app-settings-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-component.html',
  styleUrl: './settings-component.css',
})
export class SettingsComponent implements OnInit {

  private settingsService = inject(SettingsService);
  public globalService = inject(GlobalServiceService);

  // ================= STATE =================
  user = signal<any>(null);
  activeTab = signal<'profil' | 'securite' | 'apparence'>('profil');

  profileForm = signal<ProfileForm>({ nom: '', email: '' });
  passwordForm = signal<PasswordForm>({ motDePasse: '', confirmation: '' });
  apparenceForm = signal<ApparenceForm>({ theme: 'light', langue: 'fr' });

  showPassword = signal(false);
  showConfirmation = signal(false);
  isSaving = signal(false);

  // ================= INIT =================
  ngOnInit(): void {
    const stored = localStorage.getItem('user');

    if (stored) {
      const u = JSON.parse(stored);

      this.user.set(u);

      this.profileForm.set({
        nom: u.nom ?? '',
        email: u.email ?? ''
      });
    }

    const theme = localStorage.getItem('theme') ?? 'light';
    const langue = localStorage.getItem('langue') ?? 'fr';

    this.apparenceForm.set({ theme, langue });

    this.applyTheme(theme);
  }

  // ================= HELPERS =================
  private getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  // ================= PROFILE =================
  updateProfileField(field: keyof ProfileForm, event: Event): void {
    const value = this.getValue(event);

    this.profileForm.update(s => ({
      ...s,
      [field]: value
    }));
  }

  updateProfile(): void {
    const { nom, email } = this.profileForm();

    if (!nom.trim() || !email.trim()) {
      this.globalService.alert('Champs requis', 'Erreur', 'danger', '', 'OK');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      this.globalService.alert('Email invalide', 'Erreur', 'danger', '', 'OK');
      return;
    }

    this.isSaving.set(true);

    this.settingsService.updateProfile(this.user()?.id, { nom, email }).subscribe({
      next: () => {
        const updated = { ...this.user(), nom, email };

        localStorage.setItem('user', JSON.stringify(updated));

        this.user.set(updated);

        this.isSaving.set(false);

        this.globalService.alert(
          'Profil mis à jour',
          'Succès',
          'success',
          '',
          'OK'
        );
      },
      error: (err) => {
        this.isSaving.set(false);

        this.globalService.alert(
          err?.error?.message ?? 'Erreur serveur',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= PASSWORD =================
  updatePasswordField(field: keyof PasswordForm, event: Event): void {
    const value = this.getValue(event);

    this.passwordForm.update(s => ({
      ...s,
      [field]: value
    }));
  }

  updatePassword(): void {
    const { motDePasse, confirmation } = this.passwordForm();

    if (!motDePasse || !confirmation) {
      this.globalService.alert('Champs requis', 'Erreur', 'danger', '', 'OK');
      return;
    }

    if (motDePasse !== confirmation) {
      this.globalService.alert('Mots de passe différents', 'Erreur', 'danger', '', 'OK');
      return;
    }

    if (motDePasse.length < 6) {
      this.globalService.alert('Min 6 caractères', 'Erreur', 'danger', '', 'OK');
      return;
    }

    const regex = /^(?=.*[A-Za-z])(?=.*\d)/;

    if (!regex.test(motDePasse)) {
      this.globalService.alert('Doit contenir lettre + chiffre', 'Erreur', 'danger', '', 'OK');
      return;
    }

    this.isSaving.set(true);

    this.settingsService.updatePassword(this.user()?.id, { motDePasse }).subscribe({
      next: () => {
        this.passwordForm.set({ motDePasse: '', confirmation: '' });

        this.isSaving.set(false);

        this.globalService.alert(
          'Mot de passe modifié',
          'Succès',
          'success',
          '',
          'OK'
        );
      },
      error: (err) => {
        this.isSaving.set(false);

        this.globalService.alert(
          err?.error?.message ?? 'Erreur serveur',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= APPARENCE =================
  updateApparenceField(field: keyof ApparenceForm, event: Event): void {
    const value = this.getValue(event);

    this.apparenceForm.update(s => ({
      ...s,
      [field]: value
    }));
  }

  saveApparence(): void {
    const { theme, langue } = this.apparenceForm();

    this.applyTheme(theme);

    localStorage.setItem('langue', langue);

    this.globalService.alert(
      'Préférences sauvegardées',
      'OK',
      'success',
      '',
      'OK'
    );
  }

  applyTheme(theme: string): void {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // ================= UI =================
  setTab(tab: 'profil' | 'securite' | 'apparence'): void {
    this.activeTab.set(tab);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmation(): void {
    this.showConfirmation.update(v => !v);
  }

  // ================= DISPLAY =================
  getInitials(): string {
    const nom = this.user()?.nom ?? '';

    return nom
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleBadgeClass(): string {
    const role = this.user()?.role;

    switch (role) {
      case 'ADMIN':
        return 'bg-danger';
      case 'VENDEUR':
        return 'bg-primary';
      case 'CAISSIER':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  // ================= VALIDATIONS =================
  hasLetter(): boolean {
    return /[A-Za-z]/.test(this.passwordForm().motDePasse);
  }

  hasNumber(): boolean {
    return /\d/.test(this.passwordForm().motDePasse);
  }

  hasMinLength(): boolean {
    return this.passwordForm().motDePasse.length >= 6;
  }

  passwordsMatch(): boolean {
    const { motDePasse, confirmation } = this.passwordForm();

    return !!motDePasse && motDePasse === confirmation;
  }
}