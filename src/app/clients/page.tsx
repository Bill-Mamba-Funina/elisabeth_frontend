"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Client {
  id: number;
  full_name?: string;
  nom?: string;
  prenom?: string;
  phone?: string;
  telephone?: string;
  email?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/clients/");

        console.log("Réponse API clients :", response.data);

        const data = response.data;

        if (Array.isArray(data)) {
          setClients(data);
        } else if (Array.isArray(data.results)) {
          setClients(data.results);
        } else if (Array.isArray(data.data)) {
          setClients(data.data);
        } else {
          console.error(
            "Format inattendu de la réponse clients :",
            data
          );

          setClients([]);
          setError(
            "Le serveur a retourné un format de données inattendu."
          );
        }
      } catch (err) {
        console.error("Erreur lors du chargement des clients :", err);

        setClients([]);
        setError("Impossible de charger la liste des clients.");
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">
          👥 Clients
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading && (
          <p className="py-6 text-center text-gray-500">
            Chargement des clients...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Nom
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Téléphone
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Email
                  </th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => {
                  const fullName =
                    client.full_name ||
                    `${client.prenom || ""} ${client.nom || ""}`.trim() ||
                    "-";

                  const phone =
                    client.phone ||
                    client.telephone ||
                    "-";

                  return (
                    <tr
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {fullName}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {phone}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {client.email || "-"}
                      </td>
                    </tr>
                  );
                })}

                {clients.length === 0 && (
                  <tr>
                    <td
                      className="py-8 text-center text-gray-500"
                      colSpan={3}
                    >
                      Aucun client enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

