"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import {
  Edit,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Expense {
  id: number;
  title: string;
  category: string;
  category_display?: string;
  amount: number | string;
  expense_date: string;
  status: string;
  status_display?: string;
  notes?: string;
  created_at?: string;
}

const EXPENSE_TYPES = [
  {
    value: "EAU",
    label: "Eau",
  },
  {
    value: "ELECTRICITE",
    label: "Électricité",
  },
  {
    value: "SALAIRE",
    label: "Salaire",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];

const EXPENSE_STATUSES = [
  {
    value: "EN_ATTENTE",
    label: "En attente",
  },
  {
    value: "PAYEE",
    label: "Payée",
  },
  {
    value: "ANNULEE",
    label: "Annulée",
  },
];

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(
    []
  );

  const [form, setForm] = useState({
    title: "",
    category: "",
    notes: "",
    amount: "",
    expense_date: getToday(),
    status: "EN_ATTENTE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `${API_ROUTES.EXPENSES}?page_size=1000`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results ?? [];

      setExpenses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error: unknown) {
      console.error(
        "❌ ERREUR CHARGEMENT DÉPENSES :",
        error
      );

      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (
          data &&
          typeof data === "object" &&
          "detail" in data
        ) {
          setError(
            String(
              (data as {
                detail?: unknown;
              }).detail ??
                "Impossible de charger les dépenses."
            )
          );
        } else {
          setError(
            "Impossible de charger les dépenses."
          );
        }
      } else {
        setError(
          "Une erreur inattendue est survenue."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.category) {
      setError(
        "Veuillez sélectionner le type de dépense."
      );
      return;
    }

    if (
      form.category === "AUTRE" &&
      !form.title.trim()
    ) {
      setError(
        "Veuillez saisir le titre de la dépense."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Le montant doit être supérieur à zéro."
      );
      return;
    }

    if (!form.expense_date) {
      setError(
        "Veuillez sélectionner la date."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category: form.category,
        title:
          form.category === "AUTRE"
            ? form.title.trim()
            : "",
        amount: Number(form.amount),
        expense_date: form.expense_date,
        status: form.status,
        notes: form.notes.trim(),
      };

      console.log(
        "📤 [POST EXPENSE] :",
        payload
      );

      await api.post(
        API_ROUTES.EXPENSES,
        payload
      );

      setForm({
        title: "",
        category: "",
        notes: "",
        amount: "",
        expense_date: getToday(),
        status: "EN_ATTENTE",
      });

      await loadExpenses();
    } catch (error: unknown) {
      console.error(
        "❌ [POST EXPENSE] :",
        error
      );

      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (
          data &&
          typeof data === "object"
        ) {
          const messages = Object.entries(data)
            .map(([field, value]) => {
              if (Array.isArray(value)) {
                return `${field} : ${value.join(", ")}`;
              }

              return `${field} : ${String(value)}`;
            })
            .join(" | ");

          setError(
            messages ||
              "Impossible d'enregistrer la dépense."
          );
        } else {
          setError(
            "Impossible d'enregistrer la dépense."
          );
        }
      } else {
        setError(
          "Une erreur inattendue est survenue."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dépenses
          </h1>

          <p className="mt-1 text-sm text-white/60">
            Enregistrement et suivi des dépenses.
          </p>
        </div>

        <button
          type="button"
          onClick={loadExpenses}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Actualiser
        </button>
      </div>

      {/* INFORMATION */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="font-medium text-amber-300">
          Gestion de la caisse
        </p>

        <p className="mt-1 text-sm text-amber-200/70">
          Une dépense en attente n'affecte pas
          la caisse. Lorsqu'une dépense est
          enregistrée comme payée, son montant
          est automatiquement déduit de la caisse.
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Nouvelle dépense
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Choisissez le type et le statut de
            la dépense.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2"
        >

          {/* TYPE */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Type de dépense
            </label>

            <select
              id="category"
              required
              value={form.category}
              onChange={(event) => {
                const category =
                  event.target.value;

                setForm((current) => ({
                  ...current,
                  category,
                  title:
                    category === "AUTRE"
                      ? current.title
                      : "",
                }));
              }}
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Sélectionner le type
              </option>

              {EXPENSE_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* TITRE */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Nature / titre
            </label>

            <input
              id="title"
              type="text"
              required={
                form.category === "AUTRE"
              }
              value={
                form.category === "AUTRE"
                  ? form.title
                  : form.category
                    ? EXPENSE_TYPES.find(
                        (type) =>
                          type.value ===
                          form.category
                      )?.label ?? ""
                    : ""
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              disabled={
                saving ||
                !form.category ||
                form.category !== "AUTRE"
              }
              placeholder={
                form.category === "AUTRE"
                  ? "Ex. Achat de matériel"
                  : "Le titre est automatique"
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* MONTANT */}
          <div>
            <label
              htmlFor="amount"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Montant
            </label>

            <input
              id="amount"
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm({
                  ...form,
                  amount:
                    event.target.value,
                })
              }
              disabled={saving}
              placeholder="Ex. 150"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500"
            />
          </div>

          {/* DATE */}
          <div>
            <label
              htmlFor="expense_date"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Date de la dépense
            </label>

            <input
              id="expense_date"
              required
              type="date"
              value={form.expense_date}
              onChange={(event) =>
                setForm({
                  ...form,
                  expense_date:
                    event.target.value,
                })
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* STATUT */}
          <div className="md:col-span-2">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Statut
            </label>

            <select
              id="status"
              required
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status:
                    event.target.value,
                })
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              {EXPENSE_STATUSES.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Notes / détails
              <span className="ml-2 text-white/40">
                (facultatif)
              </span>
            </label>

            <textarea
              id="notes"
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes:
                    event.target.value,
                })
              }
              disabled={saving}
              placeholder="Informations complémentaires..."
              className="min-h-28 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500"
            />
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Enregistrer la dépense
              </>
            )}
          </button>

        </form>
      </div>

      {/* HISTORIQUE */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">

        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold text-white">
            Historique des dépenses
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Les dépenses enregistrées restent
            conservées dans l'historique.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/60">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />

            <p className="mt-3">
              Chargement...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-white/50">
            Aucune dépense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-5 py-4">
                    #
                  </th>

                  <th className="px-5 py-4">
                    Type
                  </th>

                  <th className="px-5 py-4">
                    Nature
                  </th>

                  <th className="px-5 py-4">
                    Montant
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map(
                  (expense) => (
                    <tr
                      key={expense.id}
                      className="border-t border-white/5"
                    >
                      <td className="px-5 py-4 text-white/50">
                        #{expense.id}
                      </td>

                      <td className="px-5 py-4 font-medium text-white">
                        {expense.category_display ??
                          expense.category}
                      </td>

                      <td className="px-5 py-4 text-white/70">
                        {expense.title}
                      </td>

                      <td className="px-5 py-4 font-semibold text-red-400">
                        -{" "}
                        {Number(
                          expense.amount
                        ).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        $
                      </td>

                      <td className="px-5 py-4 text-white/50">
                        {new Date(
                          `${expense.expense_date}T00:00:00`
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            expense.status ===
                            "PAYEE"
                              ? "text-red-400"
                              : expense.status ===
                                  "ANNULEE"
                                ? "text-white/40"
                                : "text-amber-400"
                          }
                        >
                          {expense.status_display ??
                            expense.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/finances/depenses/${expense.id}/modifier`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Link>
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

