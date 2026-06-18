import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AlertService } from './alert.service';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { Ialert } from './model/Ialert';

import { AlertmodalComponent } from './modal/alertmodal.component/alertmodal.component';
import { NotificationComponent } from '../../shared/components/notification.component/notification.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog-component/confirm-dialog-component';
import { StockService } from '../stock-component/stock.service';
import { LoaderComponent } from "../../shared/components/loader-component/loader-component";

@Component({
  selector: 'app-alerts-component',
  standalone: true,
  templateUrl: './alerts-component.html',
  styleUrl: './alerts-component.css',
  imports: [LoaderComponent],
})
export class AlertsComponent implements OnInit {

  // ===================== INJECT =====================

  private dialog = inject(MatDialog);

  private alertService = inject(AlertService);

  private snackBar = inject(MatSnackBar);

  public globalServiceService =
    inject(GlobalServiceService);

  public stockService =
    inject(StockService);

  // ===================== TITLE =====================

  TitrePage =
    signal('⚠️ Gestion des alertes');

  // ===================== DATA =====================

  alertListe =
    signal<Ialert[]>([]);

  alertFiltre =
    signal<Ialert[]>([]);

  // ===================== LOADING =====================

  isLoading =
    signal(true);

  // ===================== SEARCH =====================

  recherche =
    signal('');

  // ===================== STATS =====================

  critique = computed(() => {

    return this.alertFiltre().filter(item =>
      item.quantiteActuelle <= 0
    ).length;

  });

  faible = computed(() => {

    return this.alertFiltre().filter(item =>

      item.quantiteActuelle > 0 &&
      item.quantiteActuelle <= item.niveauAlerte

    ).length;

  });

  ok = computed(() => {

    return this.alertFiltre().filter(item =>
      item.quantiteActuelle > item.niveauAlerte
    ).length;

  });

  // ===================== INIT =====================

  ngOnInit(): void {

    this.getAllAlert();

  }

  // ===================== GET ALERT =====================

  getAllAlert(): void {

    this.isLoading.set(true);

    this.alertService.getAllAlert().subscribe({

      next: (data: Ialert[]) => {

        console.log(data);

        this.alertListe.set(data);

        this.alertFiltre.set(data);

        this.isLoading.set(false);

      },

      error: (error) => {

        console.log(error);

        this.isLoading.set(false);

      }

    });

  }

  // ===================== SEARCH =====================

  onSearch(value: string): void {

    this.recherche.set(value);

    if (!value.trim()) {

      this.alertFiltre.set(
        this.alertListe()
      );

      return;
    }

    const filtered =
      this.alertListe().filter(item =>

        item.produit.nom
          .toLowerCase()
          .includes(value.toLowerCase())

        ||

        item.produit.marque
          .toLowerCase()
          .includes(value.toLowerCase())

      );

    this.alertFiltre.set(filtered);

  }

  // ===================== REAPPRO =====================

  onReapprovisionner(item: Ialert): void {

    const dialogRef =
      this.dialog.open(
        AlertmodalComponent,
        {
          width: '500px',
          data: item
        }
      );

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.isLoading.set(true);

      this.stockService.addEntree(result).subscribe({

        next: () => {

          this.snackBar.openFromComponent(
            NotificationComponent,
            {
              data: {
                message:
                  'Réapprovisionnement effectué ✅'
              },

              duration: 3000,
            }
          );

          this.getAllAlert();

        },

        error: (err) => {

          console.log(err);

          this.isLoading.set(false);

          this.snackBar.openFromComponent(
            NotificationComponent,
            {
              data: {
                message:
                  'Erreur réapprovisionnement ❌'
              },

              duration: 3000,
            }
          );

        }

      });

    });

  }

  // ===================== DELETE =====================

  onDelete(item: Ialert): void {

    const dialogRef =
      this.dialog.open(
        ConfirmDialogComponent,
        {
          data: {
            title: 'Supprimer alerte',

            message:
              `Supprimer l'alerte du produit ${item.produit.nom} ?`
          }
        }
      );

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.isLoading.set(true);

      this.alertService.deleteAlert(item.id).subscribe({

        next: () => {

          this.snackBar.openFromComponent(
            NotificationComponent,
            {
              data: {
                message:
                  'Alerte supprimée ✅'
              },

              duration: 3000,
            }
          );

          this.getAllAlert();

        },

        error: (err) => {

          console.log(err);

          this.isLoading.set(false);

        }

      });

    });

  }

}