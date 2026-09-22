import { z } from "zod";

export const paiementSchema = z.object({
  reservation_id: z.string().min(1, "La rservation est requise"),
  montant: z.number().positive("Le montant doit tre suprieur  0"),
  mode_paiement: z.enum([
    "ESPECES", 
    "VIREMENT_BANCAIRE", 
    "MOBILE_MONEY", 
    "CARTE", 
    "CHEQUE", 
    "AUTRE"
  ]),
  compte_financier_id: z.string().min(1, "Le compte financier est requis"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
