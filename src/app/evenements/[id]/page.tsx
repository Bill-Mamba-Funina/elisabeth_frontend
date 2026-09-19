"use client";

import { useParams } from "next/navigation";

export default function EvenementDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Détails de l'événement</h1>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <p>
          <strong>ID de l'événement :</strong> {params.id}
        </p>

        <p className="mt-2 text-gray-600">
          Les informations détaillées de l'événement seront affichées ici.
        </p>
      </div>
    </main>
  );
}
