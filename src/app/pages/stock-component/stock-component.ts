import {
  Component,
  inject,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { StockService } from './stock.service';
import { GlobalServiceService } from './../../core/service/global-service.service';

import { MatDialog } from '@angular/material/dialog';

import { ViewStockComponent } from './modal/viewStock/view.stock.component/view.stock.component';
import { EntreStockComponent } from './modal/entrestock/entre.stock.component/entre.stock.component';
import { SortieStockComponent } from './modal/sortiestock/sortie.stock.component/sortie.stock.component';
import { LoaderComponent } from '../../shared/components/loader-component/loader-component';

@Component({
  selector: 'app-stock-component',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './stock-component.html',
  styleUrl: './stock-component.css',
})
export class StockComponent implements OnInit {

  // ===================== INJECT =====================
  private stockService = inject(StockService);
  private dialog = inject(MatDialog);
  public globalService = inject(GlobalServiceService);

  // ===================== DATA =====================
  stockList = signal<any[]>([]);
  isLoading = signal(true);

  // ===================== STATS QUANTITÉS =====================
  totalStock = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.stockActuel || 0), 0)
  );

  totalEntrees = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.entrees || 0), 0)
  );

  totalSorties = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.sorties || 0), 0)
  );

  // ===================== STATS FINANCIÈRES =====================
  totalAttendu = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.totalAttendu || 0), 0)
  );

  totalRealise = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.totalRealise || 0), 0)
  );

  manqueAGagner = computed(() =>
    this.stockList().reduce((sum, item) => sum + (item.manqueAGagner || 0), 0)
  );

  tauxRealisation = computed(() => {
    const attendu = this.totalAttendu();
    if (attendu === 0) return 0;
    return Math.round((this.totalRealise() / attendu) * 100);
  });

  // ===================== INIT =====================
  ngOnInit(): void {
    this.loadStock();
  }

  // ===================== LOAD STOCK =====================
  loadStock(): void {
    this.isLoading.set(true);
    this.stockService.getAllStocks().subscribe({
      next: (data: any[]) => {
        this.stockList.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.globalService.alert(
          error?.error?.message || 'Erreur lors du chargement du stock',
          'Erreur',
          'danger',
          '',
          'OK'
        );
      }
    });
  }

  // ===================== FORMAT MONTANT =====================
  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  // ===================== VIEW =====================
  onView(data: any): void {
    this.dialog.open(ViewStockComponent, { width: '400px', data });
  }

  // ===================== ENTREE =====================
  openEntreeModal(): void { }

  onAddEntree(data: any): void {
    const dialogRef = this.dialog.open(EntreStockComponent, {
      width: '500px',
      data: { produit: data }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.isLoading.set(true);
      this.stockService.addEntree(result).subscribe({
        next: () => {
          this.globalService.alert('L\'entrée de stock a été enregistrée avec succès.', 'Entrée ajoutée ✅', 'success', '', 'OK');
          this.loadStock();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.globalService.alert(error?.error?.message || 'Erreur lors de l\'ajout de l\'entrée', 'Erreur entrée ❌', 'danger', '', 'OK');
        }
      });
    });
  }

  // ===================== SORTIE =====================
  onAddSortie(data: any): void {
    const dialogRef = this.dialog.open(SortieStockComponent, {
      width: '500px',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.isLoading.set(true);
      this.stockService.addSortie(result).subscribe({
        next: () => {
          this.globalService.alert('La sortie de stock a été enregistrée avec succès.', 'Sortie ajoutée ✅', 'success', '', 'OK');
          this.loadStock();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.globalService.alert(error?.error?.message || 'Erreur lors de l\'ajout de la sortie', 'Erreur sortie ❌', 'danger', '', 'OK');
        }
      });
    });
  }
}