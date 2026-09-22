export interface Client {
  id: string;
  nom: string;
  postnom?: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  created_at?: string;
}
