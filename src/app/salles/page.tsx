"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { Salle } from "@/types/salle";

export default function SallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSalles() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `${API_ROUTES.HALLS}?page_size=1000`
      );

      const data = response.data;

      setSalles(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Impossible de charger les salles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSalles();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Salles
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Gestion des espaces disponibles.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadSalles}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          <Link
            href="/salles/nouvelle"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter une salle
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {salles.map((salle) => (
            <div
              key={salle.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div className="flex h-48 items-center justify-center bg-slate-900">
                {salle.image ? (
                  <img
                    src={salle.image}
                    alt={salle.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-white/20" />
                )}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-semibold">
                  {salle.name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-white/60">
                  <p>
                    Capacité : {salle.capacity} personnes
                  </p>

                  <p>
                    Tarif :{" "}
                    {Number(salle.price).toLocaleString()} $
                  </p>

                  <p>
                    Statut :{" "}
                    {salle.is_active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

                <Link
                  href={`/salles/${salle.id}`}
                  className="mt-5 block rounded-lg border border-white/10 px-4 py-2 text-center text-sm hover:bg-white/10"
                >
                  Voir les détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
