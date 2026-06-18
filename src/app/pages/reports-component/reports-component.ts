import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { RapportService, Vente, StockProduit } from './rapport.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type FiltreDate = 'tout' | 'aujourd_hui' | 'semaine' | 'mois';

@Component({
  selector: 'app-reports-component',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reports-component.html',
  styleUrl: './reports-component.css',
})
export class ReportsComponent implements OnInit {

  private rapportService = inject(RapportService);

  // ===================== SIGNALS =====================
  ventes = signal<Vente[]>([]);
  stocks = signal<StockProduit[]>([]);
  isLoading = signal(true);
  erreur = signal<string | null>(null);
  filtre = signal<FiltreDate>('tout');
  recherche = signal('');

  // ===================== VENTES FILTRÉES PAR DATE =====================
  ventesFiltrees = computed(() => {
    const toutes = this.ventes();
    const f = this.filtre();
    const now = new Date();

    if (f === 'aujourd_hui') {
      return toutes.filter(v =>
        new Date(v.creeLe).toDateString() === now.toDateString()
      );
    }
    if (f === 'semaine') {
      const debut = new Date(now);
      debut.setDate(now.getDate() - 7);
      return toutes.filter(v => new Date(v.creeLe) >= debut);
    }
    if (f === 'mois') {
      return toutes.filter(v => {
        const d = new Date(v.creeLe);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return toutes;
  });

  // ===================== VENTES FILTRÉES PAR DATE + RECHERCHE =====================
  ventesAffichees = computed(() => {
    const terme = this.recherche().toLowerCase().trim();
    if (!terme) return this.ventesFiltrees();
    return this.ventesFiltrees().filter(v => {
      const produits = this.getProduits(v).toLowerCase();
      const vendeur = v.utilisateur.nom.toLowerCase();
      const date = this.formatDate(v.creeLe);
      const montant = v.montantTotal.toString();
      return produits.includes(terme) || vendeur.includes(terme) ||
        date.includes(terme) || montant.includes(terme);
    });
  });

  // ===================== COMPUTED STATS =====================
  totalProduitsVendus = computed(() =>
    this.ventesFiltrees().reduce(
      (sum, v) => sum + v.lignes.reduce((s, l) => s + l.quantite, 0), 0
    )
  );

  chiffreAffaires = computed(() =>
    this.ventesFiltrees().reduce((sum, v) => sum + v.montantTotal, 0)
  );

  stockRestant = computed(() =>
    this.stocks().reduce((sum, s) => sum + s.stockActuel, 0)
  );

  nombreAlertes = computed(() =>
    this.stocks().filter(s => s.stockActuel <= s.seuilAlerte).length
  );

  // ===================== LINE CHART (CA par jour) =====================
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: "Chiffre d'affaires",
      fill: true,
      tension: 0.4,
      borderColor: '#198754',
      backgroundColor: 'rgba(25,135,84,0.15)',
      pointBackgroundColor: '#198754',
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} FCFA`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => `${Number(val).toLocaleString('fr-FR')} FCFA`
        }
      }
    }
  };

  // ===================== BAR CHART (ventes par produit) =====================
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Quantité vendue',
      backgroundColor: 'rgba(13,110,253,0.7)',
      borderColor: '#0d6efd',
      borderWidth: 1,
    }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y ?? 0} unité(s)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // ===================== REBUILD CHARTS QUAND FILTRE CHANGE =====================
  constructor() {
    effect(() => {
      const ventes = this.ventesFiltrees();
      this.buildLineChart(ventes);
      this.buildBarChart(ventes);
    });
  }

  // ===================== INIT =====================
  ngOnInit(): void {
    this.loadVentes();
  }

  loadVentes(): void {
    this.isLoading.set(true);
    this.rapportService.getAllVentes().subscribe({
      next: (data: Vente[]) => {
        this.ventes.set(data);
        this.loadStocks();
      },
      error: (err) => {
        console.error('Erreur ventes:', err);
        this.erreur.set('Erreur lors du chargement des ventes.');
        this.isLoading.set(false);
      }
    });
  }

  loadStocks(): void {
    this.rapportService.getAllStocks().subscribe({
      next: (data: StockProduit[]) => {
        this.stocks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur stocks:', err);
        this.erreur.set('Erreur lors du chargement des stocks.');
        this.isLoading.set(false);
      }
    });
  }

  // ===================== BUILD LINE CHART =====================
  private buildLineChart(ventes: Vente[]): void {
    const map = new Map<string, number>();
    ventes.forEach(v => {
      const date = new Date(v.creeLe).toLocaleDateString('fr-FR');
      map.set(date, (map.get(date) || 0) + v.montantTotal);
    });

    this.lineChartData = {
      labels: [...map.keys()],
      datasets: [{
        data: [...map.values()],
        label: "Chiffre d'affaires",
        fill: true,
        tension: 0.4,
        borderColor: '#198754',
        backgroundColor: 'rgba(25,135,84,0.15)',
        pointBackgroundColor: '#198754',
      }]
    };
  }

  // ===================== BUILD BAR CHART =====================
  private buildBarChart(ventes: Vente[]): void {
    const map = new Map<string, number>();
    ventes.forEach(v => {
      v.lignes.forEach(l => {
        const nom = l.produit.nom;
        map.set(nom, (map.get(nom) || 0) + l.quantite);
      });
    });

    // Trier par quantité décroissante
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);

    this.barChartData = {
      labels: sorted.map(([nom]) => nom),
      datasets: [{
        data: sorted.map(([, qty]) => qty),
        label: 'Quantité vendue',
        backgroundColor: 'rgba(13,110,253,0.7)',
        borderColor: '#0d6efd',
        borderWidth: 1,
      }]
    };
  }

  // ===================== FILTRE =====================
  setFiltre(f: FiltreDate): void {
    this.filtre.set(f);
    this.recherche.set('');
  }

  getLabelFiltre(): string {
    const labels: Record<FiltreDate, string> = {
      tout: 'Tout',
      aujourd_hui: "Aujourd'hui",
      semaine: '7 derniers jours',
      mois: 'Ce mois',
    };
    return labels[this.filtre()];
  }

  onRecherche(valeur: string): void {
    this.recherche.set(valeur);
  }

  // ===================== EXPORT PDF =====================
  exporterPDF(): void {
    const doc = new jsPDF();
    const dateGeneration = new Date().toLocaleDateString('fr-FR');
    const periode = this.getLabelFiltre();

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Rapport & Analyses', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Généré le : ${dateGeneration}`, 14, 28);
    doc.text(`Période : ${periode}`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Total produits vendus', `${this.totalProduitsVendus()}`],
        ["Chiffre d'affaires", this.formatMontant(this.chiffreAffaires())],
        ['Stock restant', `${this.stockRestant()}`],
        ['Alertes stock', `${this.nombreAlertes()}`],
      ],
      headStyles: { fillColor: [33, 37, 41] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 },
    });

    const ventesY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Historique des ventes (${this.ventesAffichees().length})`, 14, ventesY);

    autoTable(doc, {
      startY: ventesY + 5,
      head: [['Date', 'Vendeur', 'Produits', 'Qté', 'Total', 'Paiement']],
      body: this.ventesAffichees().map(v => [
        this.formatDate(v.creeLe),
        v.utilisateur.nom,
        this.getProduits(v),
        `${this.getQuantiteTotale(v)}`,
        this.formatMontant(v.montantTotal),
        v.paiements.map(p => p.methodePaiement).join(', '),
      ]),
      headStyles: { fillColor: [33, 37, 41] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    const stocksY = (doc as any).lastAutoTable.finalY + 12;
    if (stocksY > 240) doc.addPage();
    const stocksTitleY = stocksY > 240 ? 20 : stocksY;
    doc.setFontSize(12);
    doc.text('État des stocks', 14, stocksTitleY);

    autoTable(doc, {
      startY: stocksTitleY + 5,
      head: [['Produit', 'Marque', 'Entrées', 'Ventes', 'Sorties', 'Stock actuel', 'Statut']],
      body: this.stocks().map(s => [
        s.nom, s.marque,
        `${s.entrees}`, `${s.ventes}`, `${s.sorties}`, `${s.stockActuel}`,
        s.stockActuel <= s.seuilAlerte ? '⚠️ Alerte' : '✅ OK',
      ]),
      headStyles: { fillColor: [33, 37, 41] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} / ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`rapport-${dateGeneration.replace(/\//g, '-')}.pdf`);
  }

  // ===================== HELPERS =====================
  getProduits(vente: Vente): string {
    return vente.lignes.map(l => `${l.produit.nom} x${l.quantite}`).join(', ');
  }

  getQuantiteTotale(vente: Vente): number {
    return vente.lignes.reduce((sum, l) => sum + l.quantite, 0);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' FCFA';
  }

  isEnAlerte(stock: StockProduit): boolean {
    return stock.stockActuel <= stock.seuilAlerte;
  }
}