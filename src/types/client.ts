export interface Client {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;

  reservations_count?: number;

  created_at?: string;
  updated_at?: string;
}
