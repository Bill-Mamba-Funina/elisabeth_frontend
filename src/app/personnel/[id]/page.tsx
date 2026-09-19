"use client";

import { useParams } from "next/navigation";

export default function PersonnelDetailsPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Détails du personnel</h1>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <p>
          <strong>ID du personnel :</strong> {params.id}
        </p>
        <p className="mt-2 text-gray-600">
          Les informations détaillées du membre du personnel seront affichées
          ici.
        </p>
      </div>
    </main>
  );
}
