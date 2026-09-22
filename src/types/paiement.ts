export type ModePaiement = "ESPECES" | "VIREMENT_BANCAIRE" | "MOBILE_MONEY" | "CARTE" | "CHEQUE" | "AUTRE";

export interface Paiement {
  id: string;
  reservation: string;
  montant: number;
  mode_paiement: ModePaiement;
  compte_financier: string;
  compte_financier_nom?: string;
  reference?: string;
  date_paiement: string;
  utilisateur?: string;
  notes?: string;
}
