export interface user {
    id: string;
    nom: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'VENDEUR' | 'CAISSIER';
    compteId: string;
    creeLe: string | Date;
}

export interface LoginPayload {
    code: string;
    email: string;
    password: string;
}