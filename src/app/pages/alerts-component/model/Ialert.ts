export interface Ialert {
    id: string;
    produitId: string;
    quantiteActuelle: number;
    niveauAlerte: number;

    produit: {
        nom: string;
        marque: string;
    };
}