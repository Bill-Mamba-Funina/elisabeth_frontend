"use client";

import PageHeader from "@/components/shared/PageHeader";

const rooms = [
  { name: "Grande Salle", capacity: 500, price: 1000, status: "Disponible" },
  { name: "Salle VIP", capacity: 100, price: 400, status: "Disponible" },
  { name: "Salle B", capacity: 200, price: 600, status: "Occupée" },
  { name: "Jardin", capacity: 300, price: 500, status: "Disponible" },
];

export default function SallesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Salles"
        description="Gestion des espaces disponibles pour les événements."
        action="Ajouter une salle"
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {rooms.map((room) => (
          <div key={room.name} className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{room.name}</h2>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>Capacité : {room.capacity} personnes</p>
              <p>Tarif : {room.price.toLocaleString()} $</p>
              <p>
                Statut :{" "}
                <span className="font-medium text-gray-900">
                  {room.status}
                </span>
              </p>
            </div>

            <button className="mt-5 w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Voir les détails
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
