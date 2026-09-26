"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  History,
  Loader2,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface MaterialHistory {
  id: number;
  action: string;
  action_label?: string;
  quantity_before?: number | null;
  quantity_after?: number | null;
  etat_before?: string | null;
  etat_after?: string | null;
  description?: string | null;
  created_at: string;
}

function getEtatLabel(
  etat?: string | null
) {
  switch (etat) {
    case "ACTIF":
      return "Actif";

    case "EN_REPARATION":
      return "En réparation";

    case "ABIME":
      return "Abîmé";

    default:
      return etat || "-";
  }
}

export default function HistoriqueMaterielPage() {
  const params = useParams();

  const id = String(params.id);

  const [history, setHistory] =
    useState<MaterialHistory[]>([]);

  const [materialName, setMaterialName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        const [
          materialResponse,
          historyResponse,
        ] = await Promise.all([
          api.get(
            `${API_ROUTES.MATERIALS}${id}/`
          ),
          api.get(
            `${API_ROUTES.MATERIALS}${id}/historique/`
          ),
        ]);

        setMaterialName(
          materialResponse.data?.name ?? ""
        );

        const data =
          historyResponse.data?.results ??
          historyResponse.data ??
          [];

        setHistory(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Impossible de charger l'historique."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadHistory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/materiel"
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Historique du matériel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {materialName ||
              "Historique des opérations"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          <History className="mx-auto h-10 w-10 text-gray-300" />

          <p className="mt-3">
            Aucun historique disponible.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Opération
                  </th>

                  <th className="px-5 py-4">
                    Quantité
                  </th>

                  <th className="px-5 py-4">
                    État
                  </th>

                  <th className="px-5 py-4">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {new Date(
                        item.created_at
                      ).toLocaleString(
                        "fr-FR"
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {item.action_label ||
                        item.action}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {item.quantity_before !==
                        null &&
                      item.quantity_before !==
                        undefined
                        ? `${item.quantity_before} → ${item.quantity_after}`
                        : item.quantity_after ??
                          "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {item.etat_before
                        ? `${getEtatLabel(
                            item.etat_before
                          )} → ${getEtatLabel(
                            item.etat_after
                          )}`
                        : getEtatLabel(
                            item.etat_after
                          )}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.description ||
                        "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}