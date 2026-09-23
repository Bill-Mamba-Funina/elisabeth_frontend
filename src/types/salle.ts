export interface Salle {
  id: number;
  name: string;
  description?: string | null;
  capacity: number;
  price: number | string;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SalleFormData {
  name: string;
  description: string;
  capacity: number;
  price: number;
  is_active: boolean;
  image?: File | null;
}
