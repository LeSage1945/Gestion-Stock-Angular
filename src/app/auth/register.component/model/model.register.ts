export interface RegisterUser {
  nom: string;
  email: string;
  motDePasse: string;
  role?: 'ADMIN' | 'VENDEUR' | 'CAISSIER';
}