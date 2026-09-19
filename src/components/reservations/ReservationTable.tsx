import Link from "next/link";
import ReservationStatus from "./ReservationStatus";

type Reservation = {
  id: number | string;
  reference: string;
  client: string;
  salle: string;
  date: string;
  statut: string;
  montant: number;
};

export default function ReservationTable({
  reservations,
}: {
  reservations: Reservation[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3">Référence</th>
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3">Salle</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3">Montant</th>
            <th className="px-5 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id} className="border-t">
              <td className="px-5 py-4 font-medium">{reservation.reference}</td>
              <td className="px-5 py-4">{reservation.client}</td>
              <td className="px-5 py-4">{reservation.salle}</td>
              <td className="px-5 py-4">{reservation.date}</td>
              <td className="px-5 py-4">
                <ReservationStatus status={reservation.statut} />
              </td>
              <td className="px-5 py-4 font-semibold">{reservation.montant} $</td>
              <td className="px-5 py-4">
                <Link
                  href={`/app/reservations/${reservation.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reservations.length === 0 && (
        <p className="p-8 text-center text-gray-500">
          Aucune réservation trouvée.
        </p>
      )}
    </div>
  );
}
