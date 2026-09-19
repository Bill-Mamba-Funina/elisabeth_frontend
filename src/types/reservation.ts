export interface Reservation {
  id: number;
  clientId: number;
  salleId: number;
  evenementId?: number;
  dateDebut: string;
  dateFin: string;
  nombreInvites: number;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE" | "TERMINEE" | string;
  montantTotal?: number;
  caution?: number;
  notes?: string;
  createdAt?: string;
}
