import { z } from "zod";

export const clientSchema = z.object({
  nom: z.string().min(2, "Le nom est obligatoire"),
  prenom: z.string().min(2, "Le prénom est obligatoire"),
  telephone: z.string().min(8, "Le téléphone est obligatoire"),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
