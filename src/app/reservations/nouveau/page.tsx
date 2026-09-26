"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import ReservationForm from "@/components/reservations/ReservationForm";

export default function NouvelleReservationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/reservations");
    router.refresh();
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reservations"
          className="
            rounded-lg
            border border-slate-700
            bg-slate-900
            p-2
            text-slate-300
            transition
            hover:bg-slate-800
          "
          aria-label="Retour aux réservations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Nouvelle réservation
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Créez une réservation pour un client et une salle.
          </p>
        </div>
      </div>

      <ReservationForm onSubmitSuccess={handleSuccess} />
    </section>
  );
}