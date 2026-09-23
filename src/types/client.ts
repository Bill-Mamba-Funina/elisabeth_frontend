export interface Client {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientFormData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}
