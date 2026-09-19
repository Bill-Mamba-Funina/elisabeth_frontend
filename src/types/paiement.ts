export interface Paiement {
  id: number;
  reservationId: number;
  clientId?: number;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  reference?: string;
  statut?: string;
}
