"use client";

interface Client {
  id?: number | string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export default function ClientDetails({
  client,
}: {
  client: Client;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">
        Informations du client
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-400">
            Nom complet
          </p>

          <p className="font-medium text-white">
            {client.full_name}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Téléphone
          </p>

          <p className="font-medium text-white">
            {client.phone || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Email
          </p>

          <p className="font-medium text-white">
            {client.email || "-"}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-slate-400">
            Adresse
          </p>

          <p className="font-medium text-white">
            {client.address || "-"}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-slate-400">
            Notes
          </p>

          <p className="font-medium text-white">
            {client.notes || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}