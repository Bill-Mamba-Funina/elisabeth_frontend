import { z } from "zod";

export const depenseSchema = z.object({
  libelle: z.string().min(2, "Le libellé est obligatoire"),
  montant: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  date: z.string().min(1, "La date est obligatoire"),
  description: z.string().optional(),
});

export type DepenseFormData = z.infer<typeof depenseSchema>;
