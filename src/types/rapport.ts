export interface Rapport {
  id: number;
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  totalRecettes?: number;
  totalDepenses?: number;
  resultat?: number;
  createdAt?: string;
}
