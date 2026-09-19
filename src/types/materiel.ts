export interface Materiel {
  id: number;
  nom: string;
  description?: string;
  quantite: number;
  quantiteDisponible?: number;
  etat?: string;
  prix?: number;
  salleId?: number;
}
