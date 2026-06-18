import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { FournisseurService } from '../fournisseur.service';
import { Ifournisseur } from '../fournisseur.model';

import { NotificationComponent } from '../../../shared/components/notification.component/notification.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  private fournisseurService =
    inject(FournisseurService);

  private snackBar =
    inject(MatSnackBar);

  public globalServiceService =
    inject(GlobalServiceService);

  // ===================== TITLE =====================

  TitrePage =
    signal('📦 Gestion des Fournisseurs');

  // ===================== DATA =====================

  fournisseurListe =
    signal<Ifournisseur[]>([]);

  fournisseurFiltre =
    signal<Ifournisseur[]>([]);

  // ===================== SEARCH =====================

  recherche =
    signal('');

  // ===================== LOADING =====================

  isLoading =
    signal(true);

  // ===================== STATS =====================

  totalFournisseurs = computed(() =>

    this.fournisseurFiltre().length

  );

  fournisseursAvecTelephone = computed(() =>

    this.fournisseurFiltre().filter(
      f => !!f.telephone
    ).length

  );

  fournisseursAvecAdresse = computed(() =>

    this.fournisseurFiltre().filter(
      f => !!f.adresse
    ).length

  );

  // ===================== INIT =====================

  ngOnInit(): void {

    this.getAllFournisseur();

  }

  // ===================== GET ALL =====================

  getAllFournisseur(): void {

    this.isLoading.set(true);

    this.fournisseurService
      .getAllFournisseur()
      .subscribe({

        next: (data: Ifournisseur[]) => {

          console.log(data);

          this.fournisseurListe.set(data);

          this.fournisseurFiltre.set(data);

          this.isLoading.set(false);

        },

        error: (error) => {

          console.log(error.error?.message);

          this.isLoading.set(false);

        }

      });

  }

  // ===================== VIEW =====================

  onView(fournisseur: Ifournisseur): void {

    this.dialog.open(
      FournisseurModalComponent,
      {
        width: '1000px',
        height: '550px',

        data: {
          action: 'view',
          data: fournisseur
        }
      }
    );

  }

  // ===================== CREATE =====================

  onCreate(): void {

    const dialogRef =
      this.dialog.open(
        FournisseurModalComponent,
        {
          width: '1000px',
          height: '550px',

          data: {
            mode: 'create',
            data: ''
          }
        }
      );

    dialogRef.afterClosed().subscribe(resultat => {

      if (!resultat) return;

      this.isLoading.set(true);

      this.fournisseurService
        .createFournisseur(resultat)
        .subscribe({

          next: (data) => {

            console.log(data);

            this.snackBar.openFromComponent(
              NotificationComponent,
              {
                data: {
                  message:
                    'Fournisseur ajouté avec succès ✅'
                },

                duration: 3000,
              }
            );

            this.getAllFournisseur();

          },

          error: (error) => {

            console.log(error.error?.message);

            this.isLoading.set(false);

          }

        });

    });

  }

  // ===================== UPDATE =====================

  onEdit(fournisseur: Ifournisseur): void {

    console.log(fournisseur);

    const idFournisseur =
      fournisseur.id;

    const dialogRef =
      this.dialog.open(
        FournisseurModalComponent,
        {
          width: '1000px',
          height: '550px',

          data: {
            mode: 'update',
            data: fournisseur
          }
        }
      );

    dialogRef.afterClosed().subscribe(resultat => {

      console.log(resultat);

      if (!resultat) return;

      this.isLoading.set(true);

      this.fournisseurService
        .updateFournisseur(
          idFournisseur,
          resultat
        )
        .subscribe({

          next: () => {

            this.snackBar.openFromComponent(
              NotificationComponent,
              {
                data: {
                  message:
                    'Fournisseur modifié avec succès ✅'
                },

                duration: 3000,
              }
            );

            this.getAllFournisseur();

          },

          error: (error) => {

            console.log(error);

            this.isLoading.set(false);

          }

        });

    });

  }

  // ===================== DELETE =====================

  onDelete(fournisseur: Ifournisseur): void {

    console.log(fournisseur);

    const dialogRef =
      this.dialog.open(
        ConfirmDialogComponent,
        {
          data: {
            title: 'Supprimer fournisseur',

            message:
              `Voulez-vous supprimer le fournisseur ${fournisseur.nom} ?`
          }
        }
      );

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.isLoading.set(true);

      this.fournisseurService
        .deleteFournisseur(fournisseur.id)
        .subscribe({

          next: () => {

            this.snackBar.openFromComponent(
              NotificationComponent,
              {
                data: {
                  message:
                    'Fournisseur supprimé avec succès ✅'
                },

                duration: 3000,
              }
            );

            this.getAllFournisseur();

          },

          error: (error) => {

            console.log(error);

            this.isLoading.set(false);

          }

        });

    });

  }

  // ===================== SEARCH =====================

  onSearch(event: Event): void {

    const value =
      (event.target as HTMLInputElement)
        .value
        .toLowerCase();

    this.recherche.set(value);

    if (!value.trim()) {

      this.fournisseurFiltre.set(
        this.fournisseurListe()
      );

      return;
    }

    const filtered =
      this.fournisseurListe().filter(f =>

        f.nom
          .toLowerCase()
          .includes(value)

        ||

        f.adresse
          ?.toLowerCase()
          .includes(value)

        ||

        f.telephone
          ?.toLowerCase()
          .includes(value)

      );

    this.fournisseurFiltre.set(filtered);

  }

}