"use client";

import PageHeader from "@/components/shared/PageHeader";

export default function RapportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Rapports"
        description="Analysez l'activité financière et commerciale."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Réservations</p>
          <p className="mt-2 text-2xl font-bold">42</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Événements réalisés</p>
          <p className="mt-2 text-2xl font-bold">35</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Chiffre d'affaires</p>
          <p className="mt-2 text-2xl font-bold">12 500 $</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Bénéfice</p>
          <p className="mt-2 text-2xl font-bold">9 300 $</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Évolution des revenus</h2>
          <div className="mt-10 flex h-40 items-end gap-3">
            {[30, 50, 40, 70, 60, 85, 75].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t bg-gray-900"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="h-72 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Réservations par période</h2>
          <div className="mt-10 flex h-40 items-end gap-3">
            {[40, 65, 50, 80, 55, 90, 70].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t bg-gray-500"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
