"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Expense {
  id: number;
  category: string;
  category_display?: string;
  description: string;
  amount: number | string;
  expense_date: string;
  account_name?: string;
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

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
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

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results ?? [];

      setExpenses(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error(error);

      setError(
        "Impossible de charger les dépenses."
      );
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
      setError("Veuillez sélectionner le type de dépense.");
      return;
    }

    if (!form.description.trim()) {
      setError("Veuillez saisir la nature ou la description de la dépense.");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError("Le montant doit être supérieur à zéro.");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        API_ROUTES.EXPENSES,
        {
          category: form.category,
          description: form.description.trim(),
          amount: Number(form.amount),
        }
      );

      setForm({
        category: "",
        description: "",
        amount: "",
      });

      await loadExpenses();
    } catch (error: unknown) {
      console.error(error);

      const axiosError = error as {
        response?: {
          data?: {
            detail?: string;
            [key: string]: unknown;
          };
        };
      };

      const data = axiosError.response?.data;

      if (data?.detail) {
        setError(String(data.detail));
      } else {
        setError(
          "Impossible d'enregistrer la dépense."
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
            Enregistrement des dépenses et suivi des sorties de caisse.
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
              loading ? "animate-spin" : ""
            }`}
          />

          Actualiser
        </button>
      </div>

      {/* INFORMATION CAISSE */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <Wallet className="mt-0.5 h-5 w-5 text-amber-400" />

          <div>
            <p className="font-medium text-amber-300">
              Sortie automatique de caisse
            </p>

            <p className="mt-1 text-sm text-amber-200/70">
              Toute dépense enregistrée diminue automatiquement
              le solde de la caisse. Aucun compte n'est à sélectionner.
            </p>
          </div>
        </div>
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
            Le montant sera automatiquement enregistré comme une sortie de caisse.
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
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                })
              }
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
                  amount: event.target.value,
                })
              }
              disabled={saving}
              placeholder="Ex. 150"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500"
            />
          </div>

          {/* DESCRIPTION / NATURE */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Nature / description de la dépense
            </label>

            <textarea
              id="description"
              required
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              disabled={saving}
              placeholder={
                form.category === "EAU"
                  ? "Ex. Facture d'eau du mois de septembre"
                  : form.category === "ELECTRICITE"
                    ? "Ex. Facture d'électricité du mois de septembre"
                    : form.category === "SALAIRE"
                      ? "Ex. Salaire du personnel - septembre"
                      : "Saisissez manuellement la nature de la dépense"
              }
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
            Les anciennes opérations restent conservées.
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
                    Caisse
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-t border-white/5"
                  >
                    <td className="px-5 py-4 text-white/50">
                      #{expense.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-white">
                      {expense.category_display ||
                        expense.category}
                    </td>

                    <td className="px-5 py-4 text-white/70">
                      {expense.description}
                    </td>

                    <td className="px-5 py-4 font-semibold text-red-400">
                      -{" "}
                      {Number(
                        expense.amount
                      ).toLocaleString("fr-FR")}{" "}
                      $
                    </td>

                    <td className="px-5 py-4 text-white/60">
                      Caisse
                    </td>

                    <td className="px-5 py-4 text-white/50">
                      {new Date(
                        expense.expense_date
                      ).toLocaleString("fr-FR")}
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
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </section>
  );
}