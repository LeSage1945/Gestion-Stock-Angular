import { Component, inject, OnInit, signal } from '@angular/core';
import { CompteService } from './compte.service';
import { ICompte } from './model/compte.model';
import { CommonModule } from '@angular/common'; // Pour le pipe date

@Component({
  selector: 'app-compte-component',
  standalone: true,
  imports: [CommonModule], // Plus besoin de FormsModule ici !
  templateUrl: './compte-component.html',
  styleUrl: './compte-component.css',
})
export class CompteComponent implements OnInit {
  private compteService = inject(CompteService);

  comptes = signal<ICompte[]>([]);

  // Utilisation d'un Signal pour gérer l'état du formulaire
  compteForm = signal<ICompte>({
    code: '',
    nom: '',
  });

  ngOnInit(): void {
    this.loadComptes();
  }

  // Fonctions d'aide pour mettre à jour les champs avec le signal
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
        this.comptes.set(res); // Mise à jour du signal de liste
      },
      error: (err) => console.error(err),
    });
  }

  // ================= CREATE =================

  createCompte(): void {
    this.compteService.createCompte(this.compteForm()).subscribe({
      next: (res) => {
        // Ajout dans le tableau du signal
        this.comptes.update(list => [...list, res]);
        this.annulerModification();
      },
      error: (err) => console.error(err),
    });
  }

  // ================= GET ONE =================

  getCompte(id: string): void {
    this.compteService.getOneCompte(id).subscribe({
      next: (res) => {
        this.compteForm.set(res); // Remplit le formulaire via le signal
      },
      error: (err) => console.error(err),
    });
  }

  // ================= UPDATE =================

  updateCompte(id: string): void {
    this.compteService.updateCompte(id, this.compteForm()).subscribe({
      next: () => {
        this.loadComptes();
        this.annulerModification();
      },
      error: (err) => console.error(err),
    });
  }

  // ================= DELETE =================

  deleteCompte(id: string): void {
    if (!confirm('Voulez-vous supprimer ce compte ?')) return;

    this.compteService.deleteCompte(id).subscribe({
      next: () => this.loadComptes(),
      error: (err) => console.error(err),
    });
  }
}