type AlertItem = {
  id: number | string;
  titre: string;
  message: string;
  type?: "warning" | "danger" | "info" | "success";
};

export default function Alerts({ alerts = [] }: { alerts?: AlertItem[] }) {
  const data = alerts.length
    ? alerts
    : [
        {
          id: 1,
          titre: "Réservation en attente",
          message: "Une réservation nécessite votre validation.",
          type: "warning" as const,
        },
        {
          id: 2,
          titre: "Paiement reçu",
          message: "Un nouveau paiement vient d'être enregistré.",
          type: "success" as const,
        },
      ];

  return (
    <div className="space-y-3">
      {data.map((alert) => (
        <div key={alert.id} className="rounded-xl border bg-white p-4">
          <p className="font-semibold">{alert.titre}</p>
          <p className="mt-1 text-sm text-gray-500">{alert.message}</p>
        </div>
      ))}
    </div>
  );
}
