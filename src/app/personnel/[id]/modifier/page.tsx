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
  fonction: string;
  statut: string;
}

export default function ModifierPersonnelPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [fonction, setFonction] = useState("AUTRE");
  const [statut, setStatut] = useState("ACTIF");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
        setFonction(personne.fonction ?? "AUTRE");
        setStatut(personne.statut ?? "ACTIF");
      } catch (error) {
        console.error(error);

        setError(
          "Impossible de charger ce membre du personnel."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPersonnel();
    }
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!nom.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!prenom.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(
        `${API_ROUTES.PERSONNEL}${id}/`,
        {
          nom: nom.trim(),
          prenom: prenom.trim(),
          telephone: telephone.trim() || null,
          email: email.trim() || null,
          fonction,
          statut,
        }
      );

      router.push("/personnel");
      router.refresh();
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

      const data =
        axiosError.response?.data;

      if (data?.detail) {
        setError(String(data.detail));
      } else {
        setError(
          "Impossible de modifier le membre du personnel."
        );
      }
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
            Chargement du personnel...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">

        <Link
          href="/personnel"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white">
            Modifier le personnel
          </h1>

          <p className="mt-1 text-sm text-white/50">
            Modifier les informations du membre du personnel.
          </p>
        </div>

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

        <div>
          <h2 className="text-lg font-semibold text-white">
            Informations du personnel
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Modifiez les informations nécessaires.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* NOM */}
          <div>
            <label
              htmlFor="nom"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Nom *
            </label>

            <input
              id="nom"
              value={nom}
              onChange={(event) =>
                setNom(event.target.value)
              }
              disabled={saving}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* PRÉNOM */}
          <div>
            <label
              htmlFor="prenom"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Prénom *
            </label>

            <input
              id="prenom"
              value={prenom}
              onChange={(event) =>
                setPrenom(event.target.value)
              }
              disabled={saving}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* TELEPHONE */}
          <div>
            <label
              htmlFor="telephone"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Téléphone
            </label>

            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(event) =>
                setTelephone(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* FONCTION */}
          <div>
            <label
              htmlFor="fonction"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Fonction
            </label>

            <select
              id="fonction"
              value={fonction}
              onChange={(event) =>
                setFonction(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
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
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Statut
            </label>

            <select
              id="statut"
              value={statut}
              onChange={(event) =>
                setStatut(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
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
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

          <Link
            href="/personnel"
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
                Enregistrer
              </>
            )}
          </button>

        </div>

      </form>
    </section>
  );
}