"use client";

import { useParams } from "next/navigation";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Détails du service</h1>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <p>
          <strong>ID du service :</strong> {params.id}
        </p>

        <p className="mt-2 text-gray-600">
          Les informations détaillées du service seront affichées ici.
        </p>
      </div>
    </main>
  );
}
