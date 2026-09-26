"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Personnel {
  id: number | string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  fonction: string;
  statut: string;
  created_at?: string;
  updated_at?: string;
}

const FONCTION_LABELS: Record<string, string> = {
  GERANTE: "Gérante",
  AGENT_SECURITE: "Agent de sécurité",
  DECORATEUR: "Décorateur",
  TECHNICIEN: "Technicien",
  NETTOYEUR: "Nettoyeur",
  SERVEUR: "Serveur",
  RECEPTIONNISTE: "Réceptionniste",
  AUTRE: "Autre",
};

const FONCTIONS = [
  { value: "", label: "Toutes les fonctions" },
  { value: "GERANTE", label: "Gérante" },
  {
    value: "AGENT_SECURITE",
    label: "Agent de sécurité",
  },
  {
    value: "DECORATEUR",
    label: "Décorateur",
  },
  {
    value: "TECHNICIEN",
    label: "Technicien",
  },
  {
    value: "NETTOYEUR",
    label: "Nettoyeur",
  },
  {
    value: "SERVEUR",
    label: "Serveur",
  },
  {
    value: "RECEPTIONNISTE",
    label: "Réceptionniste",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];

function getFonctionLabel(fonction: string): string {
  return FONCTION_LABELS[fonction] ?? fonction;
}

function getStatutLabel(statut: string): string {
  switch (statut) {
    case "ACTIF":
      return "Actif";

    case "INACTIF":
      return "Inactif";

    default:
      return statut;
  }
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [fonctionFilter, setFonctionFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  async function loadPersonnel(refresh = false) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        API_ROUTES.PERSONNEL,
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

      setPersonnel(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement du personnel :",
        error
      );

      setPersonnel([]);

      setError(
        "Impossible de charger la liste du personnel."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPersonnel();
  }, []);

  const filteredPersonnel = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return personnel.filter((personne) => {
      const fullName =
        `${personne.prenom} ${personne.nom}`.toLowerCase();

      const matchesSearch =
        !searchValue ||
        fullName.includes(searchValue) ||
        personne.nom
          .toLowerCase()
          .includes(searchValue) ||
        personne.prenom
          .toLowerCase()
          .includes(searchValue) ||
        personne.telephone
          ?.toLowerCase()
          .includes(searchValue) ||
        personne.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesFonction =
        !fonctionFilter ||
        personne.fonction === fonctionFilter;

      const matchesStatut =
        !statutFilter ||
        personne.statut === statutFilter;

      return (
        matchesSearch &&
        matchesFonction &&
        matchesStatut
      );
    });
  }, [
    personnel,
    search,
    fonctionFilter,
    statutFilter,
  ]);

  const totalPersonnel = personnel.length;

  const totalActifs = personnel.filter(
    (personne) =>
      personne.statut === "ACTIF"
  ).length;

  const totalInactifs = personnel.filter(
    (personne) =>
      personne.statut === "INACTIF"
  ).length;

  async function handleDelete(
    personne: Personnel
  ) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${personne.prenom} ${personne.nom} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `${API_ROUTES.PERSONNEL}${personne.id}/`
      );

      await loadPersonnel(true);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du personnel :",
        error
      );

      setError(
        "Impossible de supprimer ce membre du personnel."
      );
    }
  }

  function resetFilters() {
    setSearch("");
    setFonctionFilter("");
    setStatutFilter("");
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Personnel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gérez les membres du personnel de La Casa da
            Festa Elisabeth.
          </p>
        </div>

        {/* UNIQUEMENT ACTUALISER */}
        <button
          type="button"
          onClick={() => loadPersonnel(true)}
          disabled={refreshing}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          Actualiser
        </button>
      </div>

      {/* =====================================================
          ERREUR
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total personnel
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalPersonnel}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Personnel actif
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {totalActifs}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Personnel inactif
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-500">
              {totalInactifs}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          FILTRES
      ===================================================== */}

      {!loading && personnel.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">
              Rechercher et filtrer
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Filtrez le personnel par nom, fonction ou
              statut.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* RECHERCHE */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un membre..."
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* FONCTION */}
            <select
              value={fonctionFilter}
              onChange={(event) =>
                setFonctionFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {FONCTIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            {/* STATUT */}
            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Tous les statuts
              </option>

              <option value="ACTIF">
                Actif
              </option>

              <option value="INACTIF">
                Inactif
              </option>
            </select>
          </div>

          {(search ||
            fonctionFilter ||
            statutFilter) && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {filteredPersonnel.length} membre
                {filteredPersonnel.length > 1
                  ? "s"
                  : ""}{" "}
                trouvé
                {filteredPersonnel.length > 1
                  ? "s"
                  : ""}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          CHARGEMENT
      ===================================================== */}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">
            Chargement du personnel...
          </p>
        </div>
      ) : personnel.length === 0 ? (
        /* ===================================================
           AUCUN PERSONNEL
        =================================================== */

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <UserRound className="mx-auto h-12 w-12 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            Aucun membre du personnel
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un membre du personnel.
          </p>

          {/* AJOUTER SEULEMENT ICI */}
          <Link
            href="/personnel/nouveau"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />

            Ajouter un membre
          </Link>
        </div>
      ) : filteredPersonnel.length === 0 ? (
        /* ===================================================
           AUCUN RÉSULTAT
        =================================================== */

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Search className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            Aucun résultat
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Aucun membre ne correspond aux filtres
            sélectionnés.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        /* ===================================================
           TABLEAU
        =================================================== */

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* EN-TÊTE */}
          <div className="hidden grid-cols-7 border-b border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700 lg:grid">
            <span>Nom</span>
            <span>Fonction</span>
            <span>Téléphone</span>
            <span>Email</span>
            <span>Statut</span>
            <span>ID</span>
            <span className="text-right">
              Actions
            </span>
          </div>

          {/* LIGNES */}
          {filteredPersonnel.map((personne) => (
            <div
              key={personne.id}
              className="border-b border-gray-200 p-4 last:border-b-0 hover:bg-gray-50"
            >
              <div className="grid gap-4 lg:grid-cols-7 lg:items-center">
                {/* NOM */}
                <div>
                  <p className="text-xs text-gray-400 lg:hidden">
                    Nom
                  </p>

                  <p className="font-medium text-gray-900">
                    {personne.prenom}{" "}
                    {personne.nom}
                  </p>
                </div>

                {/* FONCTION */}
                <div>
                  <p className="text-xs text-gray-400 lg:hidden">
                    Fonction
                  </p>

                  <p className="text-sm text-gray-700">
                    {getFonctionLabel(
                      personne.fonction
                    )}
                  </p>
                </div>

                {/* TÉLÉPHONE */}
                <div>
                  <p className="text-xs text-gray-400 lg:hidden">
                    Téléphone
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0" />

                    <span>
                      {personne.telephone ||
                        "-"}
                    </span>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 lg:hidden">
                    Email
                  </p>

                  <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 shrink-0" />

                    <span className="truncate">
                      {personne.email || "-"}
                    </span>
                  </div>
                </div>

                {/* STATUT */}
                <div>
                  <p className="mb-1 text-xs text-gray-400 lg:hidden">
                    Statut
                  </p>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      personne.statut ===
                      "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getStatutLabel(
                      personne.statut
                    )}
                  </span>
                </div>

                {/* ID */}
                <div>
                  <p className="text-xs text-gray-400 lg:hidden">
                    Identifiant
                  </p>

                  <span className="text-sm text-gray-400">
                    #{personne.id}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 lg:justify-end">
                  <Link
                    href={`/personnel/${personne.id}/modifier`}
                    className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(personne)
                    }
                    className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          RÉSULTAT DU FILTRE
      ===================================================== */}

      {!loading &&
        personnel.length > 0 &&
        filteredPersonnel.length > 0 && (
          <div className="text-sm text-gray-500">
            Affichage de{" "}
            <span className="font-medium text-gray-900">
              {filteredPersonnel.length}
            </span>{" "}
            sur{" "}
            <span className="font-medium text-gray-900">
              {personnel.length}
            </span>{" "}
            membre
            {personnel.length > 1 ? "s" : ""}.
          </div>
        )}
    </div>
  );
}

