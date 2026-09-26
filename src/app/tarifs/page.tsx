"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Tarif {
  id: number;
  name: string;
  description: string | null;
  amount: number | string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TarifForm {
  name: string;
  description: string;
  amount: string;
  is_active: boolean;
}

const initialForm: TarifForm = {
  name: "",
  description: "",
  amount: "",
  is_active: true,
};

function formatAmount(value: number | string) {
  return Number(value || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TarifsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<TarifForm>(initialForm);

  async function loadTarifs() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `${API_ROUTES.TARIFS}?page_size=1000`
      );

      const data = response.data;

      setTarifs(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err: unknown) {
      console.error(err);

      setError(
        "Impossible de charger les tarifs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTarifs();
  }, []);

  const filteredTarifs = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    return tarifs.filter((tarif) => {
      const matchesSearch =
        !value ||
        tarif.name
          .toLowerCase()
          .includes(value) ||
        (tarif.description || "")
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          tarif.is_active) ||
        (statusFilter === "inactive" &&
          !tarif.is_active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    tarifs,
    search,
    statusFilter,
  ]);

  function openCreateForm() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(tarif: Tarif) {
    setEditingId(tarif.id);

    setForm({
      name: tarif.name,
      description: tarif.description || "",
      amount: String(tarif.amount),
      is_active: tarif.is_active,
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Le nom du tarif est obligatoire."
      );
      return;
    }

    const amount = Number(form.amount);

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      setError(
        "Le montant doit être supérieur ou égal à zéro."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim() || null,
        amount: amount.toFixed(2),
        is_active: form.is_active,
      };

      if (editingId !== null) {
        await api.patch(
          `${API_ROUTES.TARIFS}${editingId}/`,
          payload
        );
      } else {
        await api.post(
          API_ROUTES.TARIFS,
          payload
        );
      }

      closeForm();

      await loadTarifs();
    } catch (err: unknown) {
      console.error(err);

      const axiosError = err as {
        response?: {
          data?: Record<string, unknown>;
        };
      };

      const backendError =
        axiosError.response?.data;

      if (backendError) {
        const messages = Object.entries(
          backendError
        )
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field} : ${value.join(", ")}`;
            }

            return `${field} : ${String(value)}`;
          })
          .join(" | ");

        setError(
          messages ||
            "Impossible d'enregistrer le tarif."
        );
      } else {
        setError(
          "Impossible d'enregistrer le tarif."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(tarif: Tarif) {
    try {
      setError("");

      await api.patch(
        `${API_ROUTES.TARIFS}${tarif.id}/`,
        {
          is_active: !tarif.is_active,
        }
      );

      await loadTarifs();
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de modifier le statut du tarif."
      );
    }
  }

  async function deleteTarif(tarif: Tarif) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le tarif "${tarif.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `${API_ROUTES.TARIFS}${tarif.id}/`
      );

      await loadTarifs();
    } catch (err) {
      console.error(err);

      setError(
        "Impossible de supprimer le tarif."
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* EN-TÊTE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Tarifs
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Gérez les tarifs utilisés pour les
            réservations de La Casa da Festa
            Elisabeth.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadTarifs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />

            Actualiser
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />

            Nouveau tarif
          </button>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {tarifs.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm text-white/50">
            Actifs
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {
              tarifs.filter(
                (tarif) => tarif.is_active
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-5">
          <p className="text-sm text-white/50">
            Inactifs
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-300">
            {
              tarifs.filter(
                (tarif) => !tarif.is_active
              ).length
            }
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un tarif..."
            className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="all">
            Tous les statuts
          </option>

          <option value="active">
            Actifs
          </option>

          <option value="inactive">
            Inactifs
          </option>
        </select>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* FORMULAIRE */}
      {showForm && (
        <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingId !== null
                  ? "Modifier le tarif"
                  : "Nouveau tarif"}
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Définissez le nom et le montant
                du tarif.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Nom du tarif *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ex. Location Grande Salle"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Montant *
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        amount:
                          event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-16 text-white outline-none focus:border-blue-500"
                    required
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    USD
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Description du tarif..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    is_active:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-950"
              />

              Tarif actif
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId !== null
                  ? "Enregistrer"
                  : "Créer le tarif"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLEAU */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-white/60">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement des tarifs...
          </div>
        ) : filteredTarifs.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            Aucun tarif trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-5 py-4">
                    N°
                  </th>

                  <th className="px-5 py-4">
                    Tarif
                  </th>

                  <th className="px-5 py-4">
                    Description
                  </th>

                  <th className="px-5 py-4">
                    Montant
                  </th>

                  <th className="px-5 py-4">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTarifs.map(
                  (tarif, index) => (
                    <tr
                      key={tarif.id}
                      className="border-b border-white/5 hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4 font-bold text-white/50">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-white">
                        {tarif.name}
                      </td>

                      <td className="max-w-md px-5 py-4 text-white/60">
                        {tarif.description ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-white">
                        {formatAmount(
                          tarif.amount
                        )}{" "}
                        $
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(
                              tarif
                            )
                          }
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            tarif.is_active
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-500/20 bg-slate-500/10 text-slate-300"
                          }`}
                        >
                          {tarif.is_active
                            ? "Actif"
                            : "Inactif"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                tarif
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTarif(
                                tarif
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

