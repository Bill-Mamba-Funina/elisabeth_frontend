"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import {
  Edit,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
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

const MONTHS = [
  {
    value: "01",
    label: "Janvier",
  },
  {
    value: "02",
    label: "Février",
  },
  {
    value: "03",
    label: "Mars",
  },
  {
    value: "04",
    label: "Avril",
  },
  {
    value: "05",
    label: "Mai",
  },
  {
    value: "06",
    label: "Juin",
  },
  {
    value: "07",
    label: "Juillet",
  },
  {
    value: "08",
    label: "Août",
  },
  {
    value: "09",
    label: "Septembre",
  },
  {
    value: "10",
    label: "Octobre",
  },
  {
    value: "11",
    label: "Novembre",
  },
  {
    value: "12",
    label: "Décembre",
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

function getYears(
  expenses: Expense[]
): string[] {
  const years = new Set<string>();

  const currentYear =
    new Date().getFullYear();

  years.add(String(currentYear));

  expenses.forEach((expense) => {
    if (!expense.expense_date) {
      return;
    }

    const year =
      expense.expense_date.substring(
        0,
        4
      );

    if (year) {
      years.add(year);
    }
  });

  return Array.from(years).sort(
    (a, b) =>
      Number(b) - Number(a)
  );
}

function formatDate(
  date: string
): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "fr-FR"
  );
}

export default function DepensesPage() {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [form, setForm] = useState({
    title: "",
    category: "",
    notes: "",
    amount: "",
    expense_date: getToday(),
    status: "EN_ATTENTE",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  // =====================================================
  // FILTRES
  // =====================================================

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [natureFilter, setNatureFilter] =
    useState("");

  const [dayFilter, setDayFilter] =
    useState("");

  const [monthFilter, setMonthFilter] =
    useState("");

  const [yearFilter, setYearFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  // =====================================================
  // CHARGEMENT
  // =====================================================

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
        const data =
          error.response?.data;

        if (
          data &&
          typeof data === "object" &&
          "detail" in data
        ) {
          setError(
            String(
              (
                data as {
                  detail?: unknown;
                }
              ).detail ??
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

  // =====================================================
  // CRÉATION
  // =====================================================

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
        "Veuillez saisir la nature de la dépense."
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

        expense_date:
          form.expense_date,

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
        const data =
          error.response?.data;

        if (
          data &&
          typeof data === "object"
        ) {
          const messages =
            Object.entries(data)
              .map(
                ([field, value]) => {
                  if (
                    Array.isArray(value)
                  ) {
                    return `${field} : ${value.join(
                      ", "
                    )}`;
                  }

                  return `${field} : ${String(
                    value
                  )}`;
                }
              )
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

  // =====================================================
  // SUPPRESSION
  // =====================================================

  async function handleDelete(
    expense: Expense
  ) {
    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer la dépense "${expense.title}" de ${Number(
          expense.amount
        ).toLocaleString(
          "fr-FR"
        )} $ ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingId(expense.id);

      await api.delete(
        `${API_ROUTES.EXPENSES}${expense.id}/`
      );

      await loadExpenses();
    } catch (error: unknown) {
      console.error(
        "❌ [DELETE EXPENSE] :",
        error
      );

      if (axios.isAxiosError(error)) {
        const data =
          error.response?.data;

        if (
          data &&
          typeof data === "object" &&
          "detail" in data
        ) {
          setError(
            String(
              (
                data as {
                  detail?: unknown;
                }
              ).detail ??
                "Impossible de supprimer la dépense."
            )
          );
        } else {
          setError(
            "Impossible de supprimer la dépense."
          );
        }
      } else {
        setError(
          "Une erreur inattendue est survenue."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // ANNÉES DISPONIBLES
  // =====================================================

  const years = useMemo(
    () => getYears(expenses),
    [expenses]
  );

  // =====================================================
  // FILTRAGE
  // =====================================================

  const filteredExpenses =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      const natureValue =
        natureFilter
          .trim()
          .toLowerCase();

      return expenses.filter(
        (expense) => {
          const expenseDate =
            expense.expense_date ?? "";

          const year =
            expenseDate.substring(
              0,
              4
            );

          const month =
            expenseDate.substring(
              5,
              7
            );

          const day =
            expenseDate.substring(
              8,
              10
            );

          const title =
            expense.title
              ?.toLowerCase() ?? "";

          const category =
            expense.category
              ?.toLowerCase() ?? "";

          const categoryDisplay =
            expense.category_display
              ?.toLowerCase() ?? "";

          const notes =
            expense.notes
              ?.toLowerCase() ?? "";

          const matchesSearch =
            !searchValue ||
            title.includes(
              searchValue
            ) ||
            category.includes(
              searchValue
            ) ||
            categoryDisplay.includes(
              searchValue
            ) ||
            notes.includes(
              searchValue
            );

          const matchesType =
            !typeFilter ||
            expense.category ===
              typeFilter;

          const matchesNature =
            !natureValue ||
            title.includes(
              natureValue
            );

          const matchesDay =
            !dayFilter ||
            day === dayFilter;

          const matchesMonth =
            !monthFilter ||
            month === monthFilter;

          const matchesYear =
            !yearFilter ||
            year === yearFilter;

          const matchesStatus =
            !statusFilter ||
            expense.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesType &&
            matchesNature &&
            matchesDay &&
            matchesMonth &&
            matchesYear &&
            matchesStatus
          );
        }
      );
    }, [
      expenses,
      search,
      typeFilter,
      natureFilter,
      dayFilter,
      monthFilter,
      yearFilter,
      statusFilter,
    ]);

  // =====================================================
  // RÉINITIALISER LES FILTRES
  // =====================================================

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setNatureFilter("");
    setDayFilter("");
    setMonthFilter("");
    setYearFilter("");
    setStatusFilter("");
  }

  const hasActiveFilters =
    Boolean(
      search ||
        typeFilter ||
        natureFilter ||
        dayFilter ||
        monthFilter ||
        yearFilter ||
        statusFilter
    );

  // =====================================================
  // TOTAL
  // =====================================================

  const totalFilteredAmount =
    filteredExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );

  return (
    <section className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

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

      {/* =================================================
          INFORMATION
      ================================================= */}

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

      {/* =================================================
          ERREUR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =================================================
          FORMULAIRE
      ================================================= */}

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

              {EXPENSE_TYPES.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* NATURE */}
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
                form.category ===
                "AUTRE"
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
                form.category !==
                  "AUTRE"
              }
              placeholder={
                form.category ===
                "AUTRE"
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
              value={
                form.expense_date
              }
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

      {/* =================================================
          HISTORIQUE
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">

        <div className="border-b border-white/10 p-5">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="font-semibold text-white">
                Historique des dépenses
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Filtrez et consultez les dépenses
                enregistrées.
              </p>
            </div>

            <div className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70">
              {filteredExpenses.length}{" "}
              résultat
              {filteredExpenses.length >
              1
                ? "s"
                : ""}
            </div>

          </div>
        </div>

        {/* =================================================
            FILTRES
        ================================================= */}

        {!loading &&
          expenses.length > 0 && (
            <div className="border-b border-white/10 p-5">

              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/60" />

                <h3 className="font-medium text-white">
                  Filtres
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* RECHERCHE */}
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Recherche
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Rechercher une dépense..."
                      className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* TYPE */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Type
                  </label>

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Tous les types
                    </option>

                    {EXPENSE_TYPES.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* NATURE */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Nature
                  </label>

                  <input
                    type="text"
                    value={natureFilter}
                    onChange={(event) =>
                      setNatureFilter(
                        event.target.value
                      )
                    }
                    placeholder="Ex. matériel"
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-500"
                  />
                </div>

                {/* JOUR */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Jour
                  </label>

                  <select
                    value={dayFilter}
                    onChange={(event) =>
                      setDayFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Tous les jours
                    </option>

                    {Array.from(
                      { length: 31 },
                      (_, index) => {
                        const day =
                          String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          );

                        return (
                          <option
                            key={day}
                            value={day}
                          >
                            {index + 1}
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>

                {/* MOIS */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Mois
                  </label>

                  <select
                    value={monthFilter}
                    onChange={(event) =>
                      setMonthFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Tous les mois
                    </option>

                    {MONTHS.map(
                      (month) => (
                        <option
                          key={
                            month.value
                          }
                          value={
                            month.value
                          }
                        >
                          {month.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ANNÉE */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Année
                  </label>

                  <select
                    value={yearFilter}
                    onChange={(event) =>
                      setYearFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Toutes les années
                    </option>

                    {years.map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUT */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Statut
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Tous les statuts
                    </option>

                    {EXPENSE_STATUSES.map(
                      (status) => (
                        <option
                          key={
                            status.value
                          }
                          value={
                            status.value
                          }
                        >
                          {status.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              {/* RÉSUMÉ FILTRES */}
              <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="text-sm text-white/50">
                  <span className="font-medium text-white">
                    {filteredExpenses.length}
                  </span>{" "}
                  dépense
                  {filteredExpenses.length >
                  1
                    ? "s"
                    : ""}{" "}
                  trouvée
                  {filteredExpenses.length >
                  1
                    ? "s"
                    : ""}

                  {" · "}

                  Total :{" "}
                  <span className="font-semibold text-red-400">
                    {totalFilteredAmount.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    $
                  </span>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />

                    Réinitialiser les filtres
                  </button>
                )}

              </div>
            </div>
          )}

        {/* =================================================
            CONTENU
        ================================================= */}

        {loading ? (
          <div className="p-10 text-center text-white/60">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />

            <p className="mt-3">
              Chargement...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-white/50">
            <p>
              Aucune dépense.
            </p>

            <p className="mt-1 text-sm">
              Les dépenses enregistrées
              apparaîtront ici.
            </p>
          </div>
        ) : filteredExpenses.length ===
          0 ? (
          <div className="p-10 text-center text-white/50">

            <Search className="mx-auto h-8 w-8 text-white/20" />

            <p className="mt-3 font-medium text-white/70">
              Aucune dépense trouvée
            </p>

            <p className="mt-1 text-sm">
              Aucun résultat ne correspond
              aux filtres sélectionnés.
            </p>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              <RotateCcw className="h-4 w-4" />

              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead className="bg-white/5 text-white/70">

                <tr>

                  <th className="w-16 px-5 py-4 text-center">
                    N°
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
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredExpenses.map(
                  (
                    expense,
                    index
                  ) => (
                    <tr
                      key={
                        expense.id
                      }
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >

                      {/* N° */}
                      <td className="px-5 py-4 text-center">

                        <span className="font-semibold text-white/50">
                          {index + 1}
                        </span>

                      </td>

                      {/* TYPE */}
                      <td className="px-5 py-4">

                        <span className="font-medium text-white">
                          {expense.category_display ??
                            expense.category}
                        </span>

                      </td>

                      {/* NATURE */}
                      <td className="px-5 py-4">

                        <div>
                          <p className="font-medium text-white">
                            {expense.title ||
                              "-"}
                          </p>

                          {expense.notes && (
                            <p className="mt-1 max-w-xs truncate text-xs text-white/40">
                              {
                                expense.notes
                              }
                            </p>
                          )}
                        </div>

                      </td>

                      {/* MONTANT */}
                      <td className="px-5 py-4">

                        <span className="font-semibold text-red-400">
                          -{" "}
                          {Number(
                            expense.amount
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          $
                        </span>

                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-white/60">
                        {formatDate(
                          expense.expense_date
                        )}
                      </td>

                      {/* STATUT */}
                      <td className="px-5 py-4">

                        <span
                          className={
                            expense.status ===
                            "PAYEE"
                              ? "inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400"
                              : expense.status ===
                                  "ANNULEE"
                                ? "inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40"
                                : "inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
                          }
                        >
                          {expense.status_display ??
                            expense.status}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {/* MODIFIER */}
                          <Link
                            href={`/finances/depenses/${expense.id}/modifier`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />

                            Modifier
                          </Link>

                          {/* SUPPRIMER */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                expense
                              )
                            }
                            disabled={
                              deletingId ===
                              expense.id
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId ===
                            expense.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}

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

