export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  fonction: string;
  role?: string;
  salaire?: number;
  dateEmbauche?: string;
  actif?: boolean;
}
