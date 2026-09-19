export interface Caisse {
  id: number;
  nom: string;
  soldeInitial: number;
  soldeActuel: number;
  devise: string;
  statut: "OUVERTE" | "FERMEE";
  dateOuverture?: string;
  dateFermeture?: string;
}

export interface MouvementCaisse {
  id: number;
  caisseId: number;
  type: "ENTREE" | "SORTIE";
  montant: number;
  motif: string;
  date: string;
}
