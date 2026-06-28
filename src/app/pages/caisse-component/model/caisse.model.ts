export interface IMouvementCaisse {
  id?: string;
  type: 'ENTREE' | 'SORTIE';
  source?: 'VENTE' | 'ACHAT_STOCK' | 'MANUEL';
  montant: number;
  motif: string;
  creeLe?: string;
  venteId?: string;
  entreeStockId?: string;
}

export interface ISolde {
  solde: number;
  totalEntrees: number;
  totalSorties: number;
}
