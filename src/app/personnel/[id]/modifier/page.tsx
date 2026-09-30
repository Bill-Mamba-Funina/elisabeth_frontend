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

interface Personnel {
  id: number | string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  fonction: string;
  statut: string;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export default function ModifierPersonnelPage() {
  const params = useParams();
  const router = useRouter();

  /**
   * Next peut retourner params.id sous forme
   * de string ou de tableau.
   */
  const rawId = params?.id;

  const id =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId
        ? String(rawId)
        : "";

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [fonction, setFonction] = useState("AUTRE");
  const [statut, setStatut] = useState("ACTIF");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Chargement du personnel
   */
  useEffect(() => {
    if (!id) {
      setError(
        "Identifiant du membre du personnel introuvable."
      );
      setLoading(false);
      return;
    }

    async function loadPersonnel() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `${API_ROUTES.PERSONNEL}${id}/`
        );

        const personne =
          response.data as Personnel;

        setNom(personne.nom ?? "");
        setPrenom(personne.prenom ?? "");
        setTelephone(personne.telephone ?? "");
        setEmail(personne.email ?? "");
        setAdresse(personne.adresse ?? "");
        setFonction(personne.fonction ?? "AUTRE");
        setStatut(personne.statut ?? "ACTIF");
      } catch (error: unknown) {
        console.error(
          "Erreur chargement personnel :",
          error
        );

        const axiosError = error as {
          response?: {
            status?: number;
            data?: ApiErrorResponse;
          };
        };

        const status =
          axiosError.response?.status;

        const data =
          axiosError.response?.data;

        if (status === 404) {
          setError(
            "Ce membre du personnel n'existe pas ou a été supprimé."
          );
        } else if (data?.detail) {
          setError(String(data.detail));
        } else {
          setError(
            "Impossible de charger ce membre du personnel."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadPersonnel();
  }, [id]);

  /**
   * Enregistrement des modifications
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!id) {
      setError(
        "Impossible de modifier ce membre : identifiant manquant."
      );
      return;
    }

    const nomValue = nom.trim();
    const prenomValue = prenom.trim();
    const telephoneValue = telephone.trim();
    const emailValue = email.trim();
    const adresseValue = adresse.trim();

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

      await api.patch(
        `${API_ROUTES.PERSONNEL}${id}/`,
        {
          nom: nomValue,
          prenom: prenomValue,
          telephone:
            telephoneValue || null,
          email:
            emailValue || null,
          adresse:
            adresseValue || null,
          fonction,
          statut,
        }
      );

      router.push("/personnel");
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "Erreur modification personnel :",
        error
      );

      const axiosError = error as {
        response?: {
          status?: number;
          data?: ApiErrorResponse;
        };
      };

      const status =
        axiosError.response?.status;

      const data =
        axiosError.response?.data;

      if (status === 404) {
        setError(
          "Ce membre du personnel n'existe plus."
        );
      } else if (data?.detail) {
        setError(String(data.detail));
      } else if (data?.message) {
        setError(String(data.message));
      } else {
        setError(
          "Impossible de modifier le membre du personnel. Vérifiez les informations saisies."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /**
   * Chargement
   */
  if (loading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />

          <p className="mt-3 text-sm">
            Chargement du personnel...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">

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
            Modifier le personnel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Modifier les informations du membre
            du personnel.
          </p>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >

        {/* TITRE */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Informations du personnel
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Modifiez les informations nécessaires.
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
              Nom{" "}
              <span className="text-red-500">*</span>
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

          {/* PRÉNOM */}
          <div>
            <label
              htmlFor="prenom"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Prénom{" "}
              <span className="text-red-500">*</span>
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

          {/* TÉLÉPHONE */}
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

          {/* ADRESSE */}
          <div className="md:col-span-2">
            <label
              htmlFor="adresse"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Adresse
            </label>

            <textarea
              id="adresse"
              name="adresse"
              value={adresse}
              onChange={(event) =>
                setAdresse(event.target.value)
              }
              placeholder="Ex. Avenue ..., Commune ..., Kinshasa"
              rows={3}
              disabled={saving}
              autoComplete="street-address"
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* FONCTION */}
          <div>
            <label
              htmlFor="fonction"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Fonction{" "}
              <span className="text-red-500">*</span>
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
            disabled={saving || !id}
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
  );
}

