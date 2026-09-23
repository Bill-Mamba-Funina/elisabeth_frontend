export interface ReservationClient {
  id: number;
  full_name?: string;
}

export interface ReservationHall {
  id: number;
  name?: string;
}

export interface Reservation {
  id: number;
  reservation_number: string;

  client: number | ReservationClient;
  client_name?: string;

  hall: number | ReservationHall;
  hall_name?: string;

  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;

  guest_count: number;

  description?: string | null;
  observations?: string | null;

  total_amount: number | string;
  paid_amount: number | string;
  remaining_amount: number | string;

  payment_status: "NON_PAYE" | "PARTIEL" | "PAYE";

  status:
    | "EN_ATTENTE"
    | "CONFIRMEE"
    | "EN_COURS"
    | "TERMINEE"
    | "CLOTUREE"
    | "ANNULEE";

  payments?: unknown[];
  services?: unknown[];
  materials?: unknown[];

  contract_file?: string | null;

  created_at?: string;
  updated_at?: string;
}
