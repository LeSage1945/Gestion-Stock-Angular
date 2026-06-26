import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaisseService } from './caisse.service';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';
import { LoaderComponent } from '../../shared/components/loader-component/loader-component';
import { IMouvementCaisse, ISolde } from './model/caisse.model';

@Component({
  selector: 'app-caisse-component',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './caisse-component.html',
  styleUrl: './caisse-component.css',
})
export class CaisseComponent implements OnInit {

  private caisseService = inject(CaisseService);
  private globalService = inject(GlobalServiceService);
  private dialog = inject(MatDialog);
  nbEntrees = computed(() => this.mouvements().filter(m => m.type === 'ENTREE').length);
  nbSorties = computed(() => this.mouvements().filter(m => m.type === 'SORTIE').length);

  // ===================== SIGNALS =====================
  mouvements = signal<IMouvementCaisse[]>([]);
  solde = signal<ISolde | null>(null);


  isLoading = signal(true);
  filtre = signal<'tout' | 'ENTREE' | 'SORTIE'>('tout');
  recherche = signal('');

  // ===================== FORM =====================
  form = signal({ type: 'ENTREE', montant: 0, motif: '' });
  showForm = signal(false);
  isSaving = signal(false);

  // ===================== COMPUTED =====================
  mouvementsFiltres = computed(() => {
    let list = this.mouvements();

    if (this.filtre() !== 'tout') {
      list = list.filter(m => m.type === this.filtre());
    }

    const terme = this.recherche().toLowerCase().trim();
    if (terme) {
      list = list.filter(m =>
        m.motif.toLowerCase().includes(terme) ||
        (m.source ?? '').toLowerCase().includes(terme) // ← fix ici
      );
    }

    return list;
  });

  totalEntrees = computed(() =>
    this.mouvements()
      .filter(m => m.type === 'ENTREE')
      .reduce((sum, m) => sum + m.montant, 0)
  );

  totalSorties = computed(() =>
    this.mouvements()
      .filter(m => m.type === 'SORTIE')
      .reduce((sum, m) => sum + m.montant, 0)
  );

  // ===================== INIT =====================
  ngOnInit(): void {
    this.loadData();
  }

  // ===================== LOAD =====================
  loadData(): void {
    this.isLoading.set(true);

    this.caisseService.getSolde().subscribe({
      next: (data) => this.solde.set(data),
      error: (err) => console.error(err)
    });

    this.caisseService.getAll().subscribe({
      next: (data) => {
        this.mouvements.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement',
          'Erreur', 'danger', '', 'OK'
        );
      }
    });
  }

  // ===================== FORM =====================
  toggleForm(): void {
    this.showForm.update(v => !v);
    this.form.set({ type: 'ENTREE', montant: 0, motif: '' });
  }

  updateForm(field: string, value: any): void {
    this.form.update(s => ({ ...s, [field]: value }));
  }

  // ===================== ADD MANUEL =====================
  addMouvement(): void {
    const { type, montant, motif } = this.form();

    if (!montant || montant <= 0) {
      this.globalService.alert('Le montant doit être supérieur à 0.', 'Champ requis', 'danger', '', 'OK');
      return;
    }

    if (!motif.trim()) {
      this.globalService.alert('Le motif est obligatoire.', 'Champ requis', 'danger', '', 'OK');
      return;
    }

    this.isSaving.set(true);

    this.caisseService.addManuel({ type, montant: Number(montant), motif }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);
        this.form.set({ type: 'ENTREE', montant: 0, motif: '' });
        this.globalService.alert(
          'Mouvement enregistré avec succès.',
          'Enregistré ✅', 'success', '', 'OK'
        );
        this.loadData();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors de l\'enregistrement',
          'Erreur ❌', 'danger', '', 'OK'
        );
      }
    });
  }

  // ===================== DELETE =====================
  deleteMouvement(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer mouvement',
        message: 'Voulez-vous supprimer ce mouvement de caisse ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.caisseService.delete(id).subscribe({
        next: () => {
          this.globalService.alert(
            'Mouvement supprimé avec succès.',
            'Supprimé ✅', 'success', '', 'OK'
          );
          this.loadData();
        },
        error: (err) => {
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression',
            'Erreur ❌', 'danger', '', 'OK'
          );
        }
      });
    });
  }

  // ===================== HELPERS =====================
  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getSourceLabel(source?: string): string {
    const labels: Record<string, string> = {
      VENTE: 'Vente',
      ACHAT_STOCK: 'Achat stock',
      MANUEL: 'Manuel',
    };
    return source ? (labels[source] || source) : '—';
  }

  getSourceBadge(source?: string): string {
    const badges: Record<string, string> = {
      VENTE: 'bg-success',
      ACHAT_STOCK: 'bg-warning text-dark',
      MANUEL: 'bg-secondary',
    };
    return source ? (badges[source] || 'bg-secondary') : 'bg-secondary';
  }
}