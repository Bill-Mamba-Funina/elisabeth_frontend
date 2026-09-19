export interface Service {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  unite?: string;
  categorie?: string;
  disponible?: boolean;
  actif?: boolean;
}
