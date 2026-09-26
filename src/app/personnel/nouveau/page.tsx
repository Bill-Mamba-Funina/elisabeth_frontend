"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

const FONCTIONS = [
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

export default function NouveauPersonnelPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [fonction, setFonction] = useState("AUTRE");
  const [statut, setStatut] = useState("ACTIF");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const nomValue = nom.trim();
    const prenomValue = prenom.trim();
    const telephoneValue = telephone.trim();
    const emailValue = email.trim();

    if (!nomValue) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!prenomValue) {
      setError("Le prénom est obligatoire.");
      return;
    }

    if (!fonction) {
      setError("La fonction est obligatoire.");
      return;
    }

    try {
      setSaving(true);

      await api.post(API_ROUTES.PERSONNEL, {
        nom: nomValue,
        prenom: prenomValue,
        telephone: telephoneValue || null,
        email: emailValue || null,
        fonction,
        statut,
      });

      router.push("/personnel");
    } catch (error: unknown) {
      console.error(
        "Erreur création personnel :",
        error
      );

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: {
              detail?: string;
              message?: string;
              [key: string]: unknown;
            };
          };
        };

        const data = axiosError.response?.data;

        if (data?.detail) {
          setError(String(data.detail));
        } else if (data?.message) {
          setError(String(data.message));
        } else {
          setError(
            "Impossible d'enregistrer le membre du personnel. Vérifiez les informations saisies."
          );
        }
      } else {
        setError(
          "Une erreur est survenue lors de l'enregistrement."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full p-6">
      <section className="mx-auto max-w-3xl space-y-6">
        {/* EN-TÊTE */}
        <div className="flex items-start gap-4">
          <Link
            href="/personnel"
            className="mt-1 inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
            title="Retour au personnel"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau membre du personnel
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Ajoutez un membre à l'équipe de La Casa da Festa Elisabeth.
            </p>
          </div>
        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* ERREUR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* INFORMATIONS */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations du personnel
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Renseignez les informations nécessaires.
            </p>
          </div>

          {/* CHAMPS */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* NOM */}
            <div>
              <label
                htmlFor="nom"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Nom <span className="text-red-500">*</span>
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                value={nom}
                onChange={(event) =>
                  setNom(event.target.value)
                }
                placeholder="Ex. Mamba"
                required
                disabled={saving}
                autoComplete="family-name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* PRENOM */}
            <div>
              <label
                htmlFor="prenom"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Prénom <span className="text-red-500">*</span>
              </label>

              <input
                id="prenom"
                name="prenom"
                type="text"
                value={prenom}
                onChange={(event) =>
                  setPrenom(event.target.value)
                }
                placeholder="Ex. Jean"
                required
                disabled={saving}
                autoComplete="given-name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* TELEPHONE */}
            <div>
              <label
                htmlFor="telephone"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Téléphone
              </label>

              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={telephone}
                onChange={(event) =>
                  setTelephone(event.target.value)
                }
                placeholder="+243 8XX XXX XXX"
                disabled={saving}
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Ex. jean@email.com"
                disabled={saving}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* FONCTION */}
            <div>
              <label
                htmlFor="fonction"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Fonction <span className="text-red-500">*</span>
              </label>

              <select
                id="fonction"
                name="fonction"
                value={fonction}
                onChange={(event) =>
                  setFonction(event.target.value)
                }
                required
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
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
            </div>

            {/* STATUT */}
            <div>
              <label
                htmlFor="statut"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Statut
              </label>

              <select
                id="statut"
                name="statut"
                value={statut}
                onChange={(event) =>
                  setStatut(event.target.value)
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="ACTIF">
                  Actif
                </option>

                <option value="INACTIF">
                  Inactif
                </option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/personnel"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

