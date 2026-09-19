"use client";

type Client = {
  id?: number | string;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
};

export default function ClientDetails({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="text-xl font-bold">Informations du client</h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Nom</p>
          <p className="font-medium">{client.nom}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Prénom</p>
          <p className="font-medium">{client.prenom || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Téléphone</p>
          <p className="font-medium">{client.telephone || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{client.email || "-"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Adresse</p>
          <p className="font-medium">{client.adresse || "-"}</p>
        </div>
      </div>
    </div>
  );
}
