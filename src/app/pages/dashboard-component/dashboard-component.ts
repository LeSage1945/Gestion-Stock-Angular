import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { SalesService } from '../sales-component/sales.service';
import { StockService } from '../stock-component/stock.service';
import { GlobalServiceService } from '../../core/service/global-service.service';
import { LoaderComponent } from '../../shared/components/loader-component/loader-component';
import { IStock } from '../stock-component/model/Istock';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [BaseChartDirective, LoaderComponent, CommonModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {

  private venteService = inject(SalesService);
  private stockService = inject(StockService);
  public globalService = inject(GlobalServiceService);

  // ===================== SIGNALS =====================
  ventes = signal<any[]>([]);
  stocks = signal<IStock[]>([]);
  isLoading = signal(true);

  // ===================== COMPUTED STATS STOCK =====================
  stockTotal = computed(() =>
    this.stocks().reduce((sum, s) => sum + (s.stockActuel || 0), 0)
  );

  totalProduits = computed(() => this.stocks().length);

  nombreAlertes = computed(() =>
    this.stocks().filter(s => s.stockActuel <= s.seuilAlerte).length
  );

  // ===================== COMPUTED STATS FINANCIÈRES =====================
  totalAttendu = computed(() =>
    this.stocks().reduce((sum, s) => sum + ((s as any).totalAttendu || 0), 0)
  );

  totalRealise = computed(() =>
    this.stocks().reduce((sum, s) => sum + ((s as any).totalRealise || 0), 0)
  );

  manqueAGagner = computed(() =>
    this.stocks().reduce((sum, s) => sum + ((s as any).manqueAGagner || 0), 0)
  );

  totalMontant = computed(() =>
    this.ventes().reduce((sum, v) => sum + Number(v.montantTotal), 0)
  );

  // ===================== CHART =====================
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Ventes',
      fill: true,
      tension: 0.4,
      borderColor: '#198754',
      backgroundColor: 'rgba(25,135,84,0.2)'
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };

  // ===================== INIT =====================
  ngOnInit(): void {
    this.loadVentes();
    this.loadStocks();
  }

  // ===================== LOAD =====================
  loadVentes(): void {
    this.venteService.getAllVente().subscribe({
      next: (data: any[]) => {
        this.ventes.set(data);
        this.buildChart(data);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data: IStock[]) => {
        this.stocks.set(data);
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  private loaded = { ventes: false, stocks: false };

  private checkLoading(): void {
    if (!this.loaded.ventes) this.loaded.ventes = true;
    else if (!this.loaded.stocks) this.loaded.stocks = true;
    if (this.loaded.ventes && this.loaded.stocks) this.isLoading.set(false);
  }

  // ===================== CHART =====================
  private buildChart(ventes: any[]): void {
    const map = new Map<string, number>();
    ventes.forEach(v => {
      const date = new Date(v.creeLe).toLocaleDateString('fr-FR');
      const total = (map.get(date) || 0) + Number(v.montantTotal);
      map.set(date, total);
    });

    this.lineChartData = {
      labels: [...map.keys()],
      datasets: [{
        data: [...map.values()],
        label: 'Ventes',
        fill: true,
        tension: 0.4,
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.2)'
      }]
    };
  }

  // ===================== HELPER =====================
  getProduits(vente: any): string {
    if (!vente.lignes?.length) return 'Produit inconnu';
    return vente.lignes.map((l: any) => `${l.produit?.nom} x${l.quantite}`).join(', ');
  }
}