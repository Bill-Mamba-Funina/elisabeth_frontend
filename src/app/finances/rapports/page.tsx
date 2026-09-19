const rapports = [
  { nom: "Rapport mensuel", periode: "Septembre 2026", recettes: 12500, depenses: 4200 },
  { nom: "Rapport trimestriel", periode: "T3 2026", recettes: 38500, depenses: 14100 },
];

export default function RapportsFinanciersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports financiers</h1>
        <p className="text-gray-500">Analyse des recettes et dépenses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Recettes</p>
          <p className="text-2xl font-bold text-green-600">38 500 $</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Dépenses</p>
          <p className="text-2xl font-bold text-red-600">14 100 $</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Solde</p>
          <p className="text-2xl font-bold">24 400 $</p>
        </div>
      </div>

      <div className="space-y-4">
        {rapports.map((rapport) => (
          <div key={rapport.nom} className="rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{rapport.nom}</h2>
                <p className="text-sm text-gray-500">{rapport.periode}</p>
              </div>
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
                Exporter
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
