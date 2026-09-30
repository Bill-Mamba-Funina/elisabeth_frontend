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
  id?: number | string;
  pk?: number | string;

  nom: string;
  prenom: string;

  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;

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
  {
    value: "",
    label: "Toutes les fonctions",
  },
  {
    value: "GERANTE",
    label: "Gérante",
  },
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

function getFonctionLabel(
  fonction: string
): string {
  return (
    FONCTION_LABELS[fonction] ??
    fonction
  );
}

function getStatutLabel(
  statut: string
): string {
  switch (statut) {
    case "ACTIF":
      return "Actif";

    case "INACTIF":
      return "Inactif";

    default:
      return statut;
  }
}

/**
 * Récupère l'identifiant du personnel.
 *
 * Normalement Django REST Framework renvoie "id".
 * "pk" est accepté en sécurité si ton API utilise
 * exceptionnellement ce nom.
 */
function getPersonnelId(
  personne: Personnel
): string {
  const value =
    personne.id ?? personne.pk;

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  return String(value);
}

function getWhatsAppUrl(
  telephone: string
): string {
  const phone =
    telephone.replace(/\D/g, "");

  return `https://wa.me/${phone}`;
}

function getGmailUrl(
  email: string
): string {
  return (
    "https://mail.google.com/mail/?" +
    `view=cm&fs=1&to=${encodeURIComponent(
      email
    )}`
  );
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] =
    useState<Personnel[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [fonctionFilter, setFonctionFilter] =
    useState("");

  const [statutFilter, setStatutFilter] =
    useState("");

  async function loadPersonnel(
    refresh = false
  ) {
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

      const rawData =
        response.data?.results ??
        response.data ??
        [];

      if (!Array.isArray(rawData)) {
        setPersonnel([]);
        setError(
          "Le format des données du personnel est incorrect."
        );
        return;
      }

      const normalizedData =
        rawData.map(
          (personne: Personnel) => ({
            ...personne,

            /**
             * On conserve l'id retourné
             * par Django.
             */
            id:
              personne.id ??
              personne.pk,
          })
        );

      setPersonnel(normalizedData);
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

  const filteredPersonnel =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return personnel.filter(
        (personne) => {
          const fullName =
            `${personne.prenom} ${personne.nom}`
              .toLowerCase();

          const matchesSearch =
            !searchValue ||
            fullName.includes(
              searchValue
            ) ||
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
              .includes(searchValue) ||
            personne.adresse
              ?.toLowerCase()
              .includes(searchValue);

          const matchesFonction =
            !fonctionFilter ||
            personne.fonction ===
              fonctionFilter;

          const matchesStatut =
            !statutFilter ||
            personne.statut ===
              statutFilter;

          return (
            matchesSearch &&
            matchesFonction &&
            matchesStatut
          );
        }
      );
    }, [
      personnel,
      search,
      fonctionFilter,
      statutFilter,
    ]);

  const totalPersonnel =
    personnel.length;

  const totalActifs =
    personnel.filter(
      (personne) =>
        personne.statut === "ACTIF"
    ).length;

  const totalInactifs =
    personnel.filter(
      (personne) =>
        personne.statut === "INACTIF"
    ).length;

  async function handleDelete(
    personne: Personnel
  ) {
    const personneId =
      getPersonnelId(personne);

    if (!personneId) {
      setError(
        "Impossible de supprimer ce membre : identifiant manquant."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer ${personne.prenom} ${personne.nom} ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `${API_ROUTES.PERSONNEL}${personneId}/`
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

      {/* EN-TÊTE */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Personnel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gérez les membres du personnel
            de La Casa da Festa Elisabeth.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              loadPersonnel(true)
            }
            disabled={refreshing}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            href="/personnel/nouveau"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />

            Ajouter un membre
          </Link>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTIQUES */}
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

      {/* FILTRES */}
      {!loading &&
        personnel.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-4">
              <h2 className="font-semibold text-gray-900">
                Rechercher et filtrer
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Filtrez le personnel par nom,
                téléphone, email, adresse,
                fonction ou statut.
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
                    setSearch(
                      event.target.value
                    )
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
                {FONCTIONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
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
                  {filteredPersonnel.length}{" "}
                  membre
                  {filteredPersonnel.length >
                  1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredPersonnel.length >
                  1
                    ? "s"
                    : ""}
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

      {/* CHARGEMENT */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">
            Chargement du personnel...
          </p>
        </div>
      ) : personnel.length === 0 ? (

        /* AUCUN PERSONNEL */
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <UserRound className="mx-auto h-12 w-12 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            Aucun membre du personnel
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un
            membre du personnel.
          </p>

          <Link
            href="/personnel/nouveau"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />

            Ajouter un membre
          </Link>
        </div>

      ) : filteredPersonnel.length ===
        0 ? (

        /* AUCUN RÉSULTAT */
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <Search className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            Aucun résultat
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Aucun membre ne correspond
            aux filtres sélectionnés.
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

        /* TABLEAU */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1300px] text-left text-sm">

              <thead className="bg-gray-50">

                <tr className="border-b border-gray-200">

                  <th className="w-16 px-5 py-4 text-center font-semibold text-gray-700">
                    N°
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Nom
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Fonction
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Téléphone
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Adresse
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredPersonnel.map(
                  (personne, index) => {
                    const personneId =
                      getPersonnelId(
                        personne
                      );

                    return (
                      <tr
                        key={
                          personneId ||
                          `${personne.nom}-${personne.prenom}-${index}`
                        }
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >

                        {/* N° */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-gray-700">
                            {index + 1}
                          </span>
                        </td>

                        {/* NOM */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {personne.prenom}{" "}
                            {personne.nom}
                          </p>
                        </td>

                        {/* FONCTION */}
                        <td className="px-5 py-4 text-gray-700">
                          {getFonctionLabel(
                            personne.fonction
                          )}
                        </td>

                        {/* TELEPHONE */}
                        <td className="px-5 py-4">
                          {personne.telephone ? (
                            <a
                              href={getWhatsAppUrl(
                                personne.telephone
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                              title="Ouvrir WhatsApp"
                            >
                              <Phone className="h-4 w-4 shrink-0" />

                              <span>
                                {
                                  personne.telephone
                                }
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* EMAIL */}
                        <td className="max-w-[240px] px-5 py-4">
                          {personne.email ? (
                            <a
                              href={getGmailUrl(
                                personne.email
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-full items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                              title="Envoyer un email avec Gmail"
                            >
                              <Mail className="h-4 w-4 shrink-0" />

                              <span className="truncate">
                                {
                                  personne.email
                                }
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* ADRESSE */}
                        <td className="max-w-[260px] px-5 py-4">
                          <span
                            className="block truncate text-gray-600"
                            title={
                              personne.adresse ??
                              undefined
                            }
                          >
                            {personne.adresse ||
                              "-"}
                          </span>
                        </td>

                        {/* STATUT */}
                        <td className="px-5 py-4">
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
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            {personneId ? (
                              <Link
                                href={`/personnel/${encodeURIComponent(
                                  personneId
                                )}/modifier`}
                                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title="Identifiant manquant"
                                className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-300"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  personne
                                )
                              }
                              disabled={
                                !personneId
                              }
                              className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION / COMPTEUR */}
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
            {personnel.length > 1
              ? "s"
              : ""}
            .
          </div>
        )}
    </div>
  );
}

