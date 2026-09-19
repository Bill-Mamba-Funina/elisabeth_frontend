type ReservationStatusProps = {
  status: string;
};

export default function ReservationStatus({
  status,
}: ReservationStatusProps) {
  const styles: Record<string, string> = {
    Confirmée: "bg-green-100 text-green-700",
    "En attente": "bg-yellow-100 text-yellow-700",
    Annulée: "bg-red-100 text-red-700",
    Terminée: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
