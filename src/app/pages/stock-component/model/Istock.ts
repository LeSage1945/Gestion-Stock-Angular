export interface IStock {
  produitId: string;
  nom: string;
  marque: string;
  stockActuel: number;
  entrees: number;
  sorties: number;
  seuilAlerte: number;
}