"use client";

import PageHeader from "@/components/shared/PageHeader";

const staff = [
  ["Patrick", "Réceptionniste"],
  ["Jean", "Agent de sécurité"],
  ["Marie", "Nettoyeuse"],
  ["Paul", "Technicien"],
  ["Sarah", "Serveuse"],
  ["David", "Décorateur"],
];

export default function PersonnelPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Personnel"
        description="Gérez les employés et leur affectation aux événements."
        action="Ajouter un employé"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map(([name, role]) => (
          <div key={name} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">{role}</p>

            <button className="mt-4 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Voir le profil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
