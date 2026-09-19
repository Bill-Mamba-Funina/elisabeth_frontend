const paiements = [
  { id: "PAY-001", reservation: "RES-2026-001", montant: 300, mode: "Espèces", statut: "Payé", date: "12/09/2026" },
  { id: "PAY-002", reservation: "RES-2026-002", montant: 500, mode: "Mobile Money", statut: "Payé", date: "15/09/2026" },
];

export default function PaiementsClientPage() {
  const total = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes paiements</h1>
        <p className="text-gray-500">Historique de vos paiements.</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border">
        <p className="text-sm text-gray-500">Total payé</p>
        <p className="mt-1 text-3xl font-bold">{total.toLocaleString()} $</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3">Référence</th>
              <th className="px-5 py-3">Réservation</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map((paiement) => (
              <tr key={paiement.id} className="border-t">
                <td className="px-5 py-4">{paiement.id}</td>
                <td className="px-5 py-4">{paiement.reservation}</td>
                <td className="px-5 py-4 font-semibold">{paiement.montant} $</td>
                <td className="px-5 py-4">{paiement.mode}</td>
                <td className="px-5 py-4 text-green-600">{paiement.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
