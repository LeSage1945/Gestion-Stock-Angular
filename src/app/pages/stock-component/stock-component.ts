import {
  Component,
  inject,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { StockService } from './stock.service';

import { MatDialog } from '@angular/material/dialog';

import { ViewStockComponent } from './modal/viewStock/view.stock.component/view.stock.component';
import { EntreStockComponent } from './modal/entrestock/entre.stock.component/entre.stock.component';
import { SortieStockComponent } from './modal/sortiestock/sortie.stock.component/sortie.stock.component';

@Component({
  selector: 'app-stock-component',
  standalone: true,
  templateUrl: './stock-component.html',
  styleUrl: './stock-component.css',
})
export class StockComponent implements OnInit {

  // ===================== INJECT =====================

  private stockService = inject(StockService);
  private dialog = inject(MatDialog);

  // ===================== DATA =====================

  stockList = signal<any[]>([]);

  isLoading = signal(true);

  // ===================== STATS (SIGNALS PRO) =====================

  totalStock = computed(() =>
    this.stockList().reduce(
      (sum, item) => sum + (item.stockActuel || 0),
      0
    )
  );

  totalEntrees = computed(() =>
    this.stockList().reduce(
      (sum, item) => sum + (item.entrees || 0),
      0
    )
  );

  totalSorties = computed(() =>
    this.stockList().reduce(
      (sum, item) => sum + (item.sorties || 0),
      0
    )
  );

  // ===================== INIT =====================

  ngOnInit(): void {
    this.loadStock();
  }

  // ===================== LOAD STOCK =====================

  loadStock(): void {

    this.isLoading.set(true);

    this.stockService.getAllStocks().subscribe({

      next: (data: any[]) => {

        console.log(data);

        this.stockList.set(data);

        this.isLoading.set(false);

      },

      error: (error) => {

        console.log(error);

        this.isLoading.set(false);

      }

    });

  }

  // ===================== VIEW =====================

  onView(data: any): void {

    this.dialog.open(ViewStockComponent, {
      width: '400px',
      data
    });

  }

  // ===================== ENTREE =====================
  openEntreeModal(): void {
    
  }

  onAddEntree(data: any): void {

    const dialogRef =
      this.dialog.open(EntreStockComponent, {
        width: '500px',
        data: { produit: data }
      });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.isLoading.set(true);

      this.stockService.addEntree(result).subscribe({

        next: () => {

          this.loadStock();

        },

        error: (error) => {

          console.log(error);

          this.isLoading.set(false);

        }

      });

    });

  }

  // ===================== SORTIE =====================

  onAddSortie(data: any): void {

    const dialogRef =
      this.dialog.open(SortieStockComponent, {
        width: '500px',
        data
      });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.isLoading.set(true);

      this.stockService.addSortie(result).subscribe({

        next: () => {

          this.loadStock();

        },

        error: (error) => {

          console.log(error);
          alert("Erreur lors de l'ajout de la sortie de stock : " + error.message);
          this.isLoading.set(false);

        }

      });

    });

  }

}