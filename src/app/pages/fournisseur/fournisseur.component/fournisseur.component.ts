import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { FournisseurService } from '../fournisseur.service';
import { Ifournisseur } from '../fournisseur.model';

import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalServiceService } from '../../../core/service/global-service.service';
import { FournisseurModalComponent } from '../modal/fournisseur.modal.component/fournisseur.modal.component';
import { LoaderComponent } from "../../../shared/components/loader-component/loader-component";

@Component({
  selector: 'app-fournisseur.component',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './fournisseur.component.html',
  styleUrl: './fournisseur.component.css',
})
export class FournisseurComponent implements OnInit {

  // ===================== INJECT =====================
  private dialog = inject(MatDialog);
  private fournisseurService = inject(FournisseurService);
  public globalService = inject(GlobalServiceService);

  // ===================== SIGNALS =====================
  TitrePage = signal('📦 Gestion des Fournisseurs');
  fournisseurListe = signal<Ifournisseur[]>([]);
  fournisseurFiltre = signal<Ifournisseur[]>([]);
  recherche = signal('');
  isLoading = signal(true);

  // ===================== STATS =====================
  totalFournisseurs = computed(() => this.fournisseurFiltre().length);

  fournisseursAvecTelephone = computed(() =>
    this.fournisseurFiltre().filter(f => !!f.telephone).length
  );

  fournisseursAvecAdresse = computed(() =>
    this.fournisseurFiltre().filter(f => !!f.adresse).length
  );

  // ===================== INIT =====================
  ngOnInit(): void {
    this.getAllFournisseur();
  }

  // ===================== GET ALL =====================
  getAllFournisseur(): void {
    this.isLoading.set(true);
    this.fournisseurService.getAllFournisseur().subscribe({
      next: (data: Ifournisseur[]) => {
        this.fournisseurListe.set(data);
        this.fournisseurFiltre.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.globalService.alert(
          err?.error?.message || 'Erreur lors du chargement des fournisseurs',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ===================== VIEW =====================
  onView(fournisseur: Ifournisseur): void {
    this.dialog.open(FournisseurModalComponent, {
      width: '1000px',
      height: '550px',
      data: { action: 'view', data: fournisseur }
    });
  }

  // ===================== CREATE =====================
  onCreate(): void {
    const dialogRef = this.dialog.open(FournisseurModalComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'create', data: '' }
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (!resultat) return;

      this.isLoading.set(true);

      this.fournisseurService.createFournisseur(resultat).subscribe({
        next: () => {
          this.globalService.alert(
            'Le fournisseur a été ajouté avec succès.',
            'Fournisseur créé ✅',
            'success',
            '',
            'OK'
          );
          this.getAllFournisseur();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la création du fournisseur',
            'Erreur création ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== UPDATE =====================
  onEdit(fournisseur: Ifournisseur): void {
    const idFournisseur = fournisseur.id;

    const dialogRef = this.dialog.open(FournisseurModalComponent, {
      width: '1000px',
      height: '550px',
      data: { mode: 'update', data: fournisseur }
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (!resultat) return;

      this.isLoading.set(true);

      this.fournisseurService.updateFournisseur(idFournisseur, resultat).subscribe({
        next: () => {
          this.globalService.alert(
            `Le fournisseur "${fournisseur.nom}" a été modifié avec succès.`,
            'Fournisseur modifié ✅',
            'success',
            '',
            'OK'
          );
          this.getAllFournisseur();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la modification du fournisseur',
            'Erreur modification ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== DELETE =====================
  onDelete(fournisseur: Ifournisseur): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer fournisseur',
        message: `Voulez-vous supprimer le fournisseur "${fournisseur.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.isLoading.set(true);

      this.fournisseurService.deleteFournisseur(fournisseur.id).subscribe({
        next: () => {
          this.globalService.alert(
            `Le fournisseur "${fournisseur.nom}" a été supprimé avec succès.`,
            'Fournisseur supprimé ✅',
            'success',
            '',
            'OK'
          );
          this.getAllFournisseur();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.globalService.alert(
            err?.error?.message || 'Erreur lors de la suppression du fournisseur',
            'Erreur suppression ❌',
            'danger',
            '',
            'OK'
          );
        }
      });
    });
  }

  // ===================== SEARCH =====================
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.recherche.set(value);

    if (!value.trim()) {
      this.fournisseurFiltre.set(this.fournisseurListe());
      return;
    }

    const filtered = this.fournisseurListe().filter(f =>
      f.nom.toLowerCase().includes(value) ||
      f.adresse?.toLowerCase().includes(value) ||
      f.telephone?.toLowerCase().includes(value)
    );

    this.fournisseurFiltre.set(filtered);
  }
}