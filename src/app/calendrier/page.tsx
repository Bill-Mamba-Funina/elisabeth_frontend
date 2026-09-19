"use client";

import PageHeader from "@/components/shared/PageHeader";

const events = [
  { date: "07/09/2026", event: "Mariage", room: "Salle A", status: "Confirmé" },
  { date: "08/09/2026", event: "Anniversaire", room: "Salle B", status: "Confirmé" },
  { date: "09/09/2026", event: "Libre", room: "Salle A", status: "Disponible" },
  { date: "10/09/2026", event: "Conférence", room: "Salle A", status: "Confirmé" },
  { date: "11/09/2026", event: "Libre", room: "Salle B", status: "Disponible" },
  { date: "12/09/2026", event: "Mariage", room: "Grande Salle", status: "Confirmé" },
  { date: "13/09/2026", event: "Anniversaire", room: "Jardin", status: "Confirmé" },
];

export default function CalendrierPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Calendrier"
        description="Visualisez les événements et la disponibilité des salles."
        action="Nouvelle réservation"
      />

      <div className="mb-6 flex gap-2">
        {["Jour", "Semaine", "Mois", "Année"].map((view) => (
          <button
            key={view}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            {view}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Septembre 2026</h2>
        </div>

        <div className="divide-y">
          {events.map((item) => (
            <div
              key={item.date}
              className="grid grid-cols-1 gap-2 p-4 md:grid-cols-4"
            >
              <span className="font-medium">{item.date}</span>
              <span>{item.event}</span>
              <span>{item.room}</span>
              <span className="text-gray-500">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
