"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: number | string;
}

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
  account_name?: string;
}

export default function DepensesPage() {
  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    financial_account: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [
        accountsResponse,
        expensesResponse,
      ] = await Promise.all([
        api.get(
          `${API_ROUTES.ACCOUNTS}?page_size=1000`
        ),
        api.get(
          `${API_ROUTES.EXPENSES}?page_size=1000`
        ),
      ]);

      setAccounts(
        Array.isArray(accountsResponse.data)
          ? accountsResponse.data
          : accountsResponse.data?.results || []
      );

      setExpenses(
        Array.isArray(expensesResponse.data)
          ? expensesResponse.data
          : expensesResponse.data?.results || []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Impossible de charger les dépenses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post(
        API_ROUTES.EXPENSES,
        {
          category: form.category,
          description: form.description,
          amount: Number(form.amount),
          financial_account: Number(
            form.financial_account
          ),
        }
      );

      setForm({
        category: "",
        description: "",
        amount: "",
        financial_account: "",
      });

      await loadData();
    } catch (error: any) {
      console.error(error);

      setError(
        typeof error?.response?.data === "object"
          ? JSON.stringify(
              error.response.data,
              null,
              2
            )
          : "Impossible d'enregistrer la dépense."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Dépenses
        </h1>

        <p className="mt-1 text-sm text-white/60">
          Enregistrement et historique des dépenses.
        </p>
      </div>

      {error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </pre>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">
          Nouvelle dépense
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <input
            required
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            placeholder="Catégorie"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />

          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
            placeholder="Montant"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />

          <select
            required
            value={form.financial_account}
            onChange={(e) =>
              setForm({
                ...form,
                financial_account: e.target.value,
              })
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          >
            <option value="">
              Sélectionner le compte
            </option>

            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name} — Solde :{" "}
                {Number(
                  account.balance
                ).toLocaleString()}{" "}
                $
              </option>
            ))}
          </select>

          <textarea
            required
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            placeholder="Description"
            className="min-h-24 rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />

          <button
            disabled={saving}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50 md:col-span-2"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer la dépense"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-semibold">
            Historique des dépenses
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            Chargement...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-white/50">
            Aucune dépense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4">
                    Catégorie
                  </th>
                  <th className="px-5 py-4">
                    Description
                  </th>
                  <th className="px-5 py-4">
                    Montant
                  </th>
                  <th className="px-5 py-4">
                    Compte
                  </th>
                  <th className="px-5 py-4">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-t border-white/5"
                  >
                    <td className="px-5 py-4">
                      {expense.category}
                    </td>

                    <td className="px-5 py-4">
                      {expense.description}
                    </td>

                    <td className="px-5 py-4 font-semibold text-red-400">
                      {Number(
                        expense.amount
                      ).toLocaleString()}{" "}
                      $
                    </td>

                    <td className="px-5 py-4">
                      {expense.account_name || "-"}
                    </td>

                    <td className="px-5 py-4 text-white/60">
                      {new Date(
                        expense.expense_date
                      ).toLocaleString("fr-FR")}
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
