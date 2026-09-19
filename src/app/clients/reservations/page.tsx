import Link from "next/link";

const reservations = [
  { id: "RES-2026-001", salle: "Salle Prestige", date: "20/09/2026", evenement: "Mariage", statut: "Confirmée", montant: 800 },
  { id: "RES-2026-002", salle: "Salle Royale", date: "28/09/2026", evenement: "Anniversaire", statut: "En attente", montant: 500 },
];

export default function ReservationsClientPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes réservations</h1>
          <p className="text-gray-500">Consultez vos réservations de salles.</p>
        </div>
        <Link href="/salles" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
          Nouvelle réservation
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-bold">{reservation.salle}</h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                {reservation.statut}
              </span>
            </div>
            <p className="mt-3 text-gray-600">{reservation.evenement}</p>
            <p className="text-gray-500">{reservation.date}</p>
            <p className="mt-3 text-xl font-bold">{reservation.montant} $</p>
            <p className="mt-2 text-xs text-gray-400">{reservation.id}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
