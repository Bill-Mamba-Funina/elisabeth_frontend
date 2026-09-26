"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

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

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
}

export default function ModifierDepensePage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExpense() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `${API_ROUTES.EXPENSES}${id}/`
        );

        const expense =
          response.data as Expense;

        setForm({
          category: expense.category ?? "",
          description: expense.description ?? "",
          amount: String(expense.amount ?? ""),
        });
      } catch (error) {
        console.error(error);

        setError(
          "Impossible de charger cette dépense."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadExpense();
    }
  }, [id]);

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
      setError("Veuillez saisir la nature de la dépense.");
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

      await api.patch(
        `${API_ROUTES.EXPENSES}${id}/`,
        {
          category: form.category,
          description: form.description.trim(),
          amount: Number(form.amount),
        }
      );

      router.push("/finances/depenses");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);

      const axiosError = error as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };

      setError(
        axiosError.response?.data?.detail ||
          "Impossible de modifier la dépense."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-white/60">
          <Loader2 className="mx-auto h-7 w-7 animate-spin" />

          <p className="mt-3">
            Chargement de la dépense...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">

        <Link
          href="/finances/depenses"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Modifier la dépense
          </h1>

          <p className="mt-1 text-sm text-white/50">
            Modification de la dépense #{id}.
          </p>
        </div>

      </div>

      {/* AVERTISSEMENT HISTORIQUE */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
        La modification ne supprime pas l'historique
        financier. Les mouvements de caisse associés
        doivent rester conservés et être corrigés par
        de nouveaux mouvements.
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
      >

        <div className="grid gap-5 md:grid-cols-2">

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
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">

            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Nature / description
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
              className="min-h-32 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

          <Link
            href="/finances/depenses"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </button>

        </div>

      </form>
    </section>
  );
}