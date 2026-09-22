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
  montantPaye?: number;
  resteAPayer?: number;

  paymentStatus?: "NON_PAYE" | "PARTIEL" | "PAYE";
};

interface ReservationTableProps {
  reservations: Reservation[];
}

export default function ReservationTable({
  reservations,
}: ReservationTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3">Référence</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Salle</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Paiement</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => {
              const montant = Number(reservation.montant || 0);
              const montantPaye = Number(reservation.montantPaye || 0);
              const resteAPayer = Math.max(
                0,
                montant - montantPaye
              );

              return (
                <tr
                  key={reservation.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-4 font-medium">
                    {reservation.reference}
                  </td>

                  <td className="px-5 py-4">
                    {reservation.client}
                  </td>

                  <td className="px-5 py-4">
                    {reservation.salle}
                  </td>

                  <td className="px-5 py-4">
                    {reservation.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {reservation.statut}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <ReservationStatus
                      totalAmount={montant}
                      paidAmount={montantPaye}
                      remainingAmount={resteAPayer}
                      paymentStatus={
                        reservation.paymentStatus || "NON_PAYE"
                      }
                    />
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    {montant.toLocaleString("fr-FR")} $
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/reservations/${reservation.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reservations.length === 0 && (
        <p className="p-8 text-center text-gray-500">
          Aucune réservation trouvée.
        </p>
      )}
    </div>
  );
}