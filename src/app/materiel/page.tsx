"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Materiel {
  id: number | string;
  name: string;
  description?: string | null;
  quantity_available: number;
  unit_price: number | string;
  etat: string;
  etat_label?: string;
  is_active: boolean;
}

const ETATS = [
  {
    value: "TOUS",
    label: "Tous les états",
  },
  {
    value: "ACTIF",
    label: "Actif",
  },
  {
    value: "EN_REPARATION",
    label: "En réparation",
  },
  {
    value: "ABIME",
    label: "Abîmé",
  },
];

function getEtatLabel(etat: string) {
  switch (etat) {
    case "ACTIF":
      return "Actif";

    case "EN_REPARATION":
      return "En réparation";

    case "ABIME":
      return "Abîmé";

    default:
      return etat;
  }
}

function getEtatClass(etat: string) {
  switch (etat) {
    case "ACTIF":
      return "bg-green-100 text-green-700";

    case "EN_REPARATION":
      return "bg-yellow-100 text-yellow-700";

    case "ABIME":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function MaterielPage() {
  const [materials, setMaterials] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [etatFilter, setEtatFilter] = useState("TOUS");

  async function loadMaterials(refresh = false) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        API_ROUTES.MATERIALS,
        {
          params: {
            page_size: 1000,
          },
        }
      );

      const data =
        response.data?.results ??
        response.data ??
        [];

      setMaterials(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement matériel :",
        error
      );

      setMaterials([]);
      setError(
        "Impossible de charger le matériel."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesSearch =
        !searchValue ||
        material.name
          .toLowerCase()
          .includes(searchValue) ||
        material.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesEtat =
        etatFilter === "TOUS" ||
        material.etat === etatFilter;

      return matchesSearch && matchesEtat;
    });
  }, [materials, search, etatFilter]);

  async function handleDelete(
    material: Materiel
  ) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${material.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `${API_ROUTES.MATERIALS}${material.id}/`
      );

      await loadMaterials(true);
    } catch (error) {
      console.error(error);

      setError(
        "Impossible de supprimer ce matériel."
      );
    }
  }

  return (
    <section className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Matériel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gestion du stock, des quantités et de l'état
            du matériel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadMaterials(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Actualiser
          </button>

          <Link
            href="/materiel/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />

            Ajouter matériel
          </Link>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTRES */}
      <div className="grid gap-4 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un matériel..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={etatFilter}
          onChange={(event) =>
            setEtatFilter(event.target.value)
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
        >
          {ETATS.map((etat) => (
            <option
              key={etat.value}
              value={etat.value}
            >
              {etat.label}
            </option>
          ))}
        </select>
      </div>

      {/* STATISTIQUES */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Matériels
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {materials.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Quantité totale
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {materials.reduce(
                (total, material) =>
                  total +
                  Number(
                    material.quantity_available
                  ),
                0
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              En réparation
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {
                materials.filter(
                  (material) =>
                    material.etat ===
                    "EN_REPARATION"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Abîmés
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {
                materials.filter(
                  (material) =>
                    material.etat === "ABIME"
                ).length
              }
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin" />

          <p className="mt-3">
            Chargement du matériel...
          </p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          Aucun matériel trouvé.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-gray-700">
                    Matériel
                  </th>

                  <th className="px-5 py-4 text-gray-700">
                    Quantité
                  </th>

                  <th className="px-5 py-4 text-gray-700">
                    Prix unitaire
                  </th>

                  <th className="px-5 py-4 text-gray-700">
                    État
                  </th>

                  <th className="px-5 py-4 text-right text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMaterials.map(
                  (material) => (
                    <tr
                      key={material.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {material.name}
                        </p>

                        {material.description && (
                          <p className="mt-1 max-w-md truncate text-xs text-gray-500">
                            {material.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {material.quantity_available}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {Number(
                          material.unit_price
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        $
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getEtatClass(
                            material.etat
                          )}`}
                        >
                          {getEtatLabel(
                            material.etat
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/materiel/${material.id}/historique`}
                            title="Historique"
                            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/materiel/${material.id}/modifier`}
                            title="Modifier"
                            className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                material
                              )
                            }
                            title="Supprimer"
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}