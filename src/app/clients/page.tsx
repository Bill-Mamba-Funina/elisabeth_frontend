"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { Client } from "@/types/client";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `${API_ROUTES.CLIENTS}?page_size=100`
      );

      const data = response.data;

      setClients(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Impossible de charger les clients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Clients
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Gestion des clients et historique de leurs réservations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadClients}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          <Link
            href="/clients/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau client
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Aucun client enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Téléphone</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5"
                  >
                    <td className="px-5 py-4 font-medium">
                      {client.full_name}
                    </td>

                    <td className="px-5 py-4 text-white/70">
                      {client.phone}
                    </td>

                    <td className="px-5 py-4 text-white/70">
                      {client.email || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4" />
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
