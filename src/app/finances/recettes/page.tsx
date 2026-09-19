const recettes = [
  { id: "REC-001", source: "Réservation salle Prestige", montant: 800, date: "12/09/2026" },
  { id: "REC-002", source: "Service décoration", montant: 250, date: "14/09/2026" },
  { id: "REC-003", source: "Réservation salle Royale", montant: 500, date: "15/09/2026" },
];

export default function RecettesPage() {
  const total = recettes.reduce((sum, recette) => sum + recette.montant, 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recettes</h1>
        <p className="text-gray-500">Toutes les entrées financières.</p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <p className="text-sm text-gray-500">Total des recettes</p>
        <p className="text-3xl font-bold text-green-600">{total.toLocaleString()} $</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3">Référence</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Montant</th>
            </tr>
          </thead>
          <tbody>
            {recettes.map((recette) => (
              <tr key={recette.id} className="border-t">
                <td className="px-5 py-4">{recette.id}</td>
                <td className="px-5 py-4">{recette.source}</td>
                <td className="px-5 py-4">{recette.date}</td>
                <td className="px-5 py-4 font-bold">{recette.montant} $</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
