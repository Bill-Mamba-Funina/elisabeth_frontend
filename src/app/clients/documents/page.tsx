const documents = [
  { id: 1, nom: "Contrat de réservation", date: "12/09/2026", statut: "Disponible" },
  { id: 2, nom: "Reçu de caution", date: "12/09/2026", statut: "Disponible" },
  { id: 3, nom: "Facture réservation", date: "13/09/2026", statut: "Disponible" },
];

export default function DocumentsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes documents</h1>
        <p className="text-gray-500">Retrouvez ici vos contrats, factures et reçus.</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3">Document</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="border-t">
                <td className="px-5 py-4 font-medium">{document.nom}</td>
                <td className="px-5 py-4">{document.date}</td>
                <td className="px-5 py-4 text-green-600">{document.statut}</td>
                <td className="px-5 py-4">
                  <button className="rounded-lg bg-gray-900 px-3 py-2 text-white">
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
