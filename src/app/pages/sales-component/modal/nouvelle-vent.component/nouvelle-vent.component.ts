import { user } from './../../../users-component/model/user.model';
import { tap, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProduitService } from '../../../products-component/produit.service';


@Component({
  selector: 'app-nouvelle-vent.component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './nouvelle-vent.component.html',
  styleUrl: './nouvelle-vent.component.css',
})
export class NouvelleVentComponent implements OnInit {
  panier: any[] = [];
  total: number = 0;
  userId!: number;
  produit: any[] = []
  // 🔎 recherche produits
  search: string = '';

  private produitService = inject(ProduitService);
  private cdr = inject(ChangeDetectorRef);


  constructor(
    private dialogRef: MatDialogRef<NouvelleVentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.getUserConnect();
    console.log("data recu du parent => ", this.data);
    if (this.data.mode === 'create') {
      this.getProduits();
    } else {
      this.produit = this.data.data;
    }
  }

  getUserConnect() {
    const user = localStorage.getItem('user');

    console.log('USER LOCALSTORAGE =', user);

    if (user) {
      const userData = JSON.parse(user);

      console.log('USER PARSE =', userData);

      this.userId = userData.id; // ✅ FIX ICI

      console.log('USER ID =', this.userId);
    }
  }

  getProduits() {
    this.produitService.getAllProduit().subscribe({
      next: (data) => {
        this.produit = data;
        this.cdr.detectChanges(); // ✅ force la mise à jour
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
      }
    });
  }

  // ================= AJOUT PRODUIT =================
  ajouterProduit(produit: any) {
    const exist = this.panier.find(p => p.id === produit.id);

    if (exist) {
      exist.quantite++;
      exist.total = exist.quantite * exist.prix;
    } else {
      this.panier.push({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: 1,
        total: produit.prix
      });
    }

    this.calculTotal();
  }

  // ================ RECUPERATION DES PRODUITS ==================


  // ================= SUPPRIMER =================
  removeProduit(index: number) {
    this.panier.splice(index, 1);
    this.calculTotal();
  }

  // ================= TOTAL =================
  calculTotal() {
    this.total = this.panier.reduce((sum, p) => sum + p.total, 0);
  }

  // ================= VALIDER VENTE =================
  validerVente() {

    if (this.panier.length === 0) {
      alert("Panier vide !");
      return;
    }

    const vente = {
      utilisateurId: this.userId,
      montantTotal: this.total,

      lignes: this.panier.map(p => ({
        produitId: p.id,
        quantite: p.quantite,
        prix: p.prix
      })),

      paiements: [
        {
          montant: this.total,
          methodePaiement: 'ESPECE'
        }
      ]
    };

    console.log("VENTE FINAL => ", vente);

    this.dialogRef.close(vente);
  }

  // ================= FERMER =================
  fermer() {
    this.dialogRef.close();
  }
}
