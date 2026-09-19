export interface Salle {
  id: number;
  nom: string;
  description?: string;
  capacite: number;
  prix?: number;
  adresse?: string;
  disponible?: boolean;
  statut?: string;
  image?: string;
}
