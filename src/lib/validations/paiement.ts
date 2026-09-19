import { z } from "zod";

export const paiementSchema = z.object({
  reservationId: z.coerce.number().positive(),
  montant: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  modePaiement: z.string().min(1, "Le mode de paiement est obligatoire"),
  datePaiement: z.string().min(1, "La date est obligatoire"),
  reference: z.string().optional(),
});

export type PaiementFormData = z.infer<typeof paiementSchema>;
