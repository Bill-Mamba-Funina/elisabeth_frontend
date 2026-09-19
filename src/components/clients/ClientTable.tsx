import Link from "next/link";

type Client = {
  id: number | string;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  statut?: string;
};

export default function ClientTable({ clients }: { clients: Client[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3">Téléphone</th>
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t">
              <td className="px-5 py-4 font-medium">
                {client.prenom} {client.nom}
              </td>
              <td className="px-5 py-4">{client.telephone || "-"}</td>
              <td className="px-5 py-4">{client.email || "-"}</td>
              <td className="px-5 py-4">{client.statut || "Actif"}</td>
              <td className="px-5 py-4">
                <Link
                  href={`/app/clients/${client.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
