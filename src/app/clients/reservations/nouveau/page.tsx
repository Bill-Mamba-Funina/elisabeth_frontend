"use client";

import React from "react";
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
      {/* ========================================================
          EN-TÊTE
      ======================================================== */}

      <div className="flex items-center gap-4">
        <Link
          href="/reservations"
          className="rounded-lg border bg-white p-2 text-gray-600 transition hover:bg-gray-50"
          aria-label="Retour aux réservations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Nouvelle réservation
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Créez une réservation pour un client et
            une salle.
          </p>
        </div>
      </div>

      {/* ========================================================
          FORMULAIRE
      ======================================================== */}

      <ReservationForm
        onSubmitSuccess={handleSuccess}
      />
    </section>
  );
}