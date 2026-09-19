import { z } from "zod";

export const reservationSchema = z.object({
  clientId: z.coerce.number().positive(),
  salleId: z.coerce.number().positive(),
  dateDebut: z.string().min(1, "La date de début est obligatoire"),
  dateFin: z.string().min(1, "La date de fin est obligatoire"),
  nombreInvites: z.coerce.number().int().nonnegative(),
  motif: z.string().optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
