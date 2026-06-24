import { Component, inject, OnInit, signal } from '@angular/core';
import { CompteService } from './compte.service';
import { ICompte } from './model/compte.model';
import { CommonModule } from '@angular/common';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';

@Component({
  selector: 'app-compte-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compte-component.html',
  styleUrl: './compte-component.css',
})
export class CompteComponent implements OnInit {

  private compteService = inject(CompteService);
  private globalService = inject(GlobalServiceService);
  private dialog = inject(MatDialog);

  comptes = signal<ICompte[]>([]);

  compteForm = signal<ICompte>({
    code: '',
    nom: '',
  });

  ngOnInit(): void {
    this.loadComptes();
  }

  updateCodeField(value: string): void {
    this.compteForm.update(state => ({ ...state, code: value.toUpperCase() }));
  }

  updateNomField(value: string): void {
    this.compteForm.update(state => ({ ...state, nom: value }));
  }

  annulerModification(): void {
    this.compteForm.set({ code: '', nom: '' });
  }

  // ================= LISTE =================
  loadComptes(): void {
    this.compteService.getAllCompte().subscribe({
      next: (res) => {
        this.comptes.set(res);
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des comptes',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= CREATE =================
  createCompte(): void {
    this.compteService.createCompte(this.compteForm()).subscribe({
      next: (res) => {
        this.globalService.alert(
          `Le compte "${res.nom}" a été créé avec succès.`,
          'Compte créé ✅',
          'success',
          '',
          'OK'
        );
        this.comptes.update(list => [...list, res]);
        this.annulerModification();
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors de la création du compte',
          'Erreur création ❌',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= GET ONE =================
  getCompte(id: string): void {
    this.compteService.getOneCompte(id).subscribe({
      next: (res) => {
        this.compteForm.set(res);
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors de la récupération du compte',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= UPDATE =================
  updateCompte(id: string): void {
    this.compteService.updateCompte(id, this.compteForm()).subscribe({
      next: () => {
        this.globalService.alert(
          'Le compte a été modifié avec succès.',
          'Compte modifié ✅',
          'success',
          '',
          'OK'
        );
        this.loadComptes();
        this.annulerModification();
      },
      error: (err) => {
        this.globalService.alert(
          err?.error?.message || 'Erreur lors de la modification du compte',
          'Erreur modification ❌',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ================= DELETE =================
  deleteCompte(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer compte',
        message: 'Voulez-vous supprimer ce compte ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.compteService.deleteCompte(id).subscribe({
        next: () => {
          this.globalService.alert(
            'Le compte a été supprimé avec succès.',
            'Compte supprimé ✅',
            'success',
            '',
            'OK'
          );
          this.loadComptes();
        },
        error: (err) => {
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression du compte',
            'Erreur suppression ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }
}