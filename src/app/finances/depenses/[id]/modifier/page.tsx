"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Save,
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

export default function ModifierDepensePage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [expense, setExpense] =
    useState<Expense | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    notes: "",
    amount: "",
    expense_date: "",
    status: "EN_ATTENTE",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // CHARGEMENT
  // ============================================================

  useEffect(() => {
    async function loadExpense() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `${API_ROUTES.EXPENSES}${id}/`
        );

        const data =
          response.data as Expense;

        setExpense(data);

        setForm({
          title: data.title ?? "",
          category: data.category ?? "",
          notes: data.notes ?? "",
          amount: String(
            data.amount ?? ""
          ),
          expense_date:
            data.expense_date ?? "",
          status:
            data.status ?? "EN_ATTENTE",
        });
      } catch (error: unknown) {
        console.error(
          "❌ ERREUR CHARGEMENT DÉPENSE :",
          error
        );

        if (axios.isAxiosError(error)) {
          console.error(
            "Réponse Django :",
            error.response?.data
          );

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
                  "Impossible de charger cette dépense."
              )
            );
          } else {
            setError(
              "Impossible de charger cette dépense."
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

    if (id) {
      loadExpense();
    }
  }, [id]);

  // ============================================================
  // CHANGEMENT DE TYPE
  // ============================================================

  function handleCategoryChange(
    category: string
  ) {
    setForm((current) => ({
      ...current,
      category,

      // Si le type n'est pas AUTRE,
      // le titre devient automatique.
      title:
        category === "AUTRE"
          ? current.title
          : "",
    }));
  }

  // ============================================================
  // SOUMISSION
  // ============================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // TYPE
    // ----------------------------------------------------------

    if (!form.category) {
      setError(
        "Veuillez sélectionner le type de dépense."
      );
      return;
    }

    // ----------------------------------------------------------
    // TITRE
    // ----------------------------------------------------------

    if (
      form.category === "AUTRE" &&
      !form.title.trim()
    ) {
      setError(
        "Veuillez saisir le titre de la dépense."
      );
      return;
    }

    // ----------------------------------------------------------
    // MONTANT
    // ----------------------------------------------------------

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Le montant doit être supérieur à zéro."
      );
      return;
    }

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    if (!form.expense_date) {
      setError(
        "Veuillez sélectionner la date de la dépense."
      );
      return;
    }

    // ----------------------------------------------------------
    // DEPENSE DEJA PAYEE
    // ----------------------------------------------------------

    if (
      expense?.status === "PAYEE" &&
      Number(form.amount) !==
        Number(expense.amount)
    ) {
      setError(
        "Le montant d'une dépense déjà payée ne peut pas être modifié. Utilisez une opération de correction financière."
      );
      return;
    }

    // ----------------------------------------------------------
    // PAYEE -> EN_ATTENTE / ANNULEE
    // ----------------------------------------------------------

    if (
      expense?.status === "PAYEE" &&
      form.status !== "PAYEE"
    ) {
      setError(
        "Une dépense déjà payée ne peut pas être annulée ou repassée en attente directement. Utilisez une opération financière dédiée."
      );
      return;
    }

    try {
      setSaving(true);

      // --------------------------------------------------------
      // TITRE
      // --------------------------------------------------------

      let title = "";

      if (form.category === "AUTRE") {
        title = form.title.trim();
      } else {
        const selectedType =
          EXPENSE_TYPES.find(
            (type) =>
              type.value ===
              form.category
          );

        title =
          selectedType?.label ?? "";
      }

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const payload = {
        title,
        category: form.category,
        amount: Number(form.amount),
        expense_date:
          form.expense_date,
        status: form.status,
        notes: form.notes.trim(),
      };

      console.log(
        "📤 [PATCH EXPENSE] Données envoyées :",
        payload
      );

      await api.patch(
        `${API_ROUTES.EXPENSES}${id}/`,
        payload
      );

      // --------------------------------------------------------
      // RETOUR
      // --------------------------------------------------------

      router.push(
        "/finances/depenses"
      );

      router.refresh();
    } catch (error: unknown) {
      console.error(
        "❌ [PATCH EXPENSE] Erreur :",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "❌ Réponse Django :",
          error.response?.data
        );

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
                "Impossible de modifier la dépense."
            )
          );
        } else if (
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
              "Impossible de modifier la dépense."
          );
        } else {
          setError(
            "Impossible de modifier la dépense."
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

  // ============================================================
  // CHARGEMENT
  // ============================================================

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

  // ============================================================
  // ERREUR CHARGEMENT
  // ============================================================

  if (!expense && error) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
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
          </div>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      </section>
    );
  }

  const isPaid =
    expense?.status === "PAYEE";

  const isOther =
    form.category === "AUTRE";

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <section className="mx-auto max-w-3xl space-y-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

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
            Modification de la dépense #
            {id}.
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* INFORMATION DEPENSE PAYEE */}
      {/* ====================================================== */}

      {isPaid && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="font-medium text-amber-300">
            Dépense déjà payée
          </p>

          <p className="mt-1 text-sm text-amber-200/70">
            Cette dépense a déjà diminué la
            caisse. Son montant et son statut
            financier ne peuvent donc pas être
            modifiés directement.
          </p>
        </div>
      )}

      {/* ====================================================== */}
      {/* INFORMATION GENERALE */}
      {/* ====================================================== */}

      {!isPaid && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
          Si vous choisissez le statut
          <strong className="mx-1">
            Payée
          </strong>
          , le montant sera automatiquement
          déduit de la caisse active.
        </div>
      )}

      {/* ====================================================== */}
      {/* ERREUR */}
      {/* ====================================================== */}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* FORMULAIRE */}
      {/* ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
      >

        <div className="grid gap-5 md:grid-cols-2">

          {/* ================================================== */}
          {/* TYPE */}
          {/* ================================================== */}

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
                handleCategoryChange(
                  event.target.value
                )
              }
              disabled={
                saving || isPaid
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* ================================================== */}
          {/* TITRE */}
          {/* ================================================== */}

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
              required={isOther}
              value={
                isOther
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
                isPaid ||
                !isOther
              }
              placeholder={
                isOther
                  ? "Ex. Achat de matériel"
                  : "Titre automatique"
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1 text-xs text-white/40">
              {isOther
                ? "Vous devez préciser la nature de la dépense."
                : "Le titre est automatiquement déterminé par le type."}
            </p>
          </div>

          {/* ================================================== */}
          {/* MONTANT */}
          {/* ================================================== */}

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
              disabled={
                saving || isPaid
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {isPaid && (
              <p className="mt-1 text-xs text-amber-400/70">
                Le montant est verrouillé car
                la dépense est déjà payée.
              </p>
            )}
          </div>

          {/* ================================================== */}
          {/* DATE */}
          {/* ================================================== */}

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
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* ================================================== */}
          {/* STATUT */}
          {/* ================================================== */}

          <div className="md:col-span-2">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Statut de la dépense
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
              disabled={
                saving || isPaid
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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

            {!isPaid && (
              <p className="mt-1 text-xs text-white/40">
                En choisissant « Payée », la
                caisse sera diminuée automatiquement.
              </p>
            )}
          </div>

          {/* ================================================== */}
          {/* NOTES */}
          {/* ================================================== */}

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
              className="min-h-32 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ====================================================== */}
        {/* ACTIONS */}
        {/* ====================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

          <Link
            href="/finances/depenses"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={
              saving || isPaid
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

