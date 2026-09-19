"use client";

import PageHeader from "@/components/shared/PageHeader";

const types = [
  "Mariage",
  "Anniversaire",
  "Baptême",
  "Conférence",
  "Réunion",
  "Deuil",
  "Autre",
];

export default function EvenementsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Événements"
        description="Gérez les différents types et événements organisés dans la salle."
        action="Nouvel événement"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {types.map((type) => (
          <div
            key={type}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold">{type}</h2>
            <p className="mt-2 text-sm text-gray-500">
              Gestion des événements de type {type.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
