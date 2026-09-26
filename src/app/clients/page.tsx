"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Eye,
  Loader2,
  MessageCircle,
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

  function getWhatsAppUrl(phone: string) {
    const cleanPhone = phone.replace(/\D/g, "");

    return `https://wa.me/${cleanPhone}`;
  }

  return (
    <section className="min-h-screen space-y-6 bg-slate-950 p-6">

      {/* ==================================================
          EN-TÊTE
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Clients
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Les clients sont automatiquement enregistrés
            lors de la création d'une réservation.
          </p>
        </div>

        <button
          type="button"
          onClick={loadClients}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Actualiser
        </button>

      </div>

      {/* ==================================================
          ERREUR
      ================================================== */}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* ==================================================
          TABLEAU
      ================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

        {loading ? (

          <div className="flex items-center justify-center p-12 text-slate-300">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement des clients...
          </div>

        ) : clients.length === 0 ? (

          <div className="p-12 text-center">

            <p className="text-slate-300">
              Aucun client enregistré.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Les clients apparaîtront automatiquement
              après la création d'une réservation.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b border-slate-800 bg-slate-800">

                <tr>

                  <th className="px-5 py-4 text-slate-200">
                    N°
                  </th>

                  <th className="px-5 py-4 text-slate-200">
                    Client
                  </th>

                  <th className="px-5 py-4 text-slate-200">
                    Téléphone
                  </th>

                  <th className="px-5 py-4 text-slate-200">
                    Email
                  </th>

                  <th className="px-5 py-4 text-slate-200">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {clients.map((client, index) => (

                  <tr
                    key={client.id}
                    className="border-b border-slate-800 transition hover:bg-slate-800/50"
                  >

                    {/* N° */}

                    <td className="px-5 py-4 text-slate-500">
                      {index + 1}
                    </td>

                    {/* CLIENT */}

                    <td className="px-5 py-4">

                      <div className="font-medium text-white">
                        {client.full_name}
                      </div>

                    </td>

                    {/* TELEPHONE / WHATSAPP */}

                    <td className="px-5 py-4">

                      {client.phone ? (

                        <a
                          href={getWhatsAppUrl(client.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir WhatsApp"
                          className="inline-flex items-center gap-2 text-green-400 transition hover:text-green-300"
                        >

                          <MessageCircle className="h-4 w-4" />

                          {client.phone}

                        </a>

                      ) : (

                        <span className="text-slate-500">
                          -
                        </span>

                      )}

                    </td>

                    {/* EMAIL */}

                    <td className="px-5 py-4 text-slate-300">
                      {client.email || "-"}
                    </td>

                    {/* HISTORIQUE */}

                    <td className="px-5 py-4">

                      <Link
                        href={`/clients/${client.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:bg-slate-800 hover:text-white"
                      >

                        <Eye className="h-4 w-4" />

                        Historique

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

