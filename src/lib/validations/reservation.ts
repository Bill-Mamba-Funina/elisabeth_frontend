import { z } from "zod";

export const reservationSchema = z.object({
  client_id: z.string().optional(),
  nouveau_client: z.object({
    nom: z.string().min(2, "Le nom est requis"),
    postnom: z.string().optional(),
    prenom: z.string().min(2, "Le prnom est requis"),
    telephone: z.string().min(8, "Numro de tlphone invalide"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
  }).optional(),

  type_evenement: z.enum([
    "Mariage", "Anniversaire", "Confrence", "Runion", 
    "Baptme", "Cocktail", "Fte familiale", "vnement professionnel", "Autre"
  ]),
  date_evenement: z.string().refine((val) => !isNaN(Date.parse(val)), "Date invalide"),
  heure_debut: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:MM requis"),
  heure_fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:MM requis"),
  nombre_invites: z.number().int().positive("Le nombre d'invits doit tre positif"),
  description: z.string().optional(),

  salle_id: z.string().min(1, "La salle est requise"),
  total_amount: z.number().positive("Le montant total doit tre suprieur  0"),
}).refine((data) => data.client_id || data.nouveau_client, {
  message: "Veuillez slectionner un client existant ou crer un nouveau client",
  path: ["client_id"],
});
