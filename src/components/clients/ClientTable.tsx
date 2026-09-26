import Link from "next/link";

interface Client {
  id: number | string;
  full_name: string;
  phone?: string;
  email?: string;
}

export default function ClientTable({
  clients,
}: {
  clients: Client[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-5 py-3 text-slate-200">
              Client
            </th>

            <th className="px-5 py-3 text-slate-200">
              Téléphone
            </th>

            <th className="px-5 py-3 text-slate-200">
              Email
            </th>

            <th className="px-5 py-3 text-slate-200">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-t border-slate-800 hover:bg-slate-800/50"
            >
              <td className="px-5 py-4 font-medium text-white">
                {client.full_name}
              </td>

              <td className="px-5 py-4 text-slate-300">
                {client.phone || "-"}
              </td>

              <td className="px-5 py-4 text-slate-300">
                {client.email || "-"}
              </td>

              <td className="px-5 py-4">
                <Link
                  href={`/clients/${client.id}`}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
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