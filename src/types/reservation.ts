export type PaymentStatus = "NON_PAYE" | "PARTIEL" | "PAYE";
export type ReservationStatus = "EN_ATTENTE" | "CONFIRMEE" | "EN_COURS" | "TERMINEE" | "CLOTUREE" | "ANNULEE";

export interface Reservation {
  id: string;
  client: string;
  client_nom?: string;
  salle: string;
  salle_nom?: string;
  type_evenement: string;
  date_evenement: string;
  heure_debut: string;
  heure_fin: string;
  nombre_invites: number;
  description?: string;
  status: ReservationStatus;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
  created_at?: string;
}
