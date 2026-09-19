"use client";

import { useParams } from "next/navigation";

export default function SalleDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Détails de la salle</h1>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <p>
          <strong>ID de la salle :</strong> {params.id}
        </p>

        <p className="mt-2 text-gray-600">
          Les informations détaillées de cette salle seront affichées ici.
        </p>
      </div>
    </main>
  );
}
