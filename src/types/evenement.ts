export interface Evenement {
  id: number;
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  clientId?: number;
  salleId?: number;
  nombreInvites?: number;
  statut?: string;
  montantTotal?: number;
}
