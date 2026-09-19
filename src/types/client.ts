export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
  createdAt?: string;
}
