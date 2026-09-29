"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MessageCircle,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Hall {
  id: number;
  name: string;
  capacity?: number | null;
  price?: number | string | null;
}

export default function DemandeDevisPage() {
  const searchParams =
    useSearchParams();

  const hallId =
    searchParams.get("salle");

  const [hall, setHall] =
    useState<Hall | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
      phone: "",
      eventDate: "",
      guests: "",
      message: "",
    });

  useEffect(() => {
    async function loadHall() {
      if (!hallId) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await api.get(
            `${API_ROUTES.HALLS}${hallId}/`
          );

        setHall(response.data);
      } catch (error) {
        console.error(
          "Erreur chargement salle :",
          error
        );

        setError(
          "Impossible de récupérer les informations de la salle."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadHall();
  }, [hallId]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!hall) {
      return;
    }

    const whatsappNumber =
      process.env
        .NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
      setError(
        "Le numéro WhatsApp de l'entreprise n'est pas configuré."
      );
      return;
    }

    const message = [
      "Bonjour La Casa da Festa Elisabeth,",
      "",
      "Je souhaite demander un devis.",
      "",
      `Salle : ${hall.name}`,
      `Nom : ${form.name}`,
      `Téléphone : ${form.phone}`,
      `Date souhaitée : ${
        form.eventDate || "À définir"
      }`,
      `Nombre de personnes : ${
        form.guests || "À définir"
      }`,
      "",
      `Message : ${
        form.message ||
        "Je souhaite avoir plus d'informations concernant cette salle."
      }`,
    ].join("\n");

    const url =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-slate-400">
            Chargement...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <section className="mx-auto max-w-2xl space-y-6">

        <Link
          href={
            hall
              ? `/salles/${hall.id}`
              : "/salles"
          }
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-blue-400" />

            <h1 className="text-3xl font-bold">
              Demander un devis
            </h1>
          </div>

          <p className="mt-3 text-slate-400">
            Remplissez les informations
            ci-dessous. Votre demande sera
            préparée pour une discussion
            WhatsApp avec notre équipe.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {hall && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
            <p className="text-sm text-blue-300">
              Salle sélectionnée
            </p>

            <p className="mt-1 text-xl font-semibold">
              {hall.name}
            </p>

            {hall.capacity != null && (
              <p className="mt-1 text-sm text-slate-400">
                Capacité :{" "}
                {hall.capacity} personnes
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >

          <div>
            <label className="mb-2 block text-sm font-medium">
              Votre nom
            </label>

            <input
              required
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              placeholder="Votre nom complet"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Téléphone / WhatsApp
            </label>

            <input
              required
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm({
                  ...form,
                  phone: event.target.value,
                })
              }
              placeholder="+243..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Date souhaitée
              </label>

              <input
                type="date"
                value={form.eventDate}
                onChange={(event) =>
                  setForm({
                    ...form,
                    eventDate:
                      event.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Nombre de personnes
              </label>

              <input
                type="number"
                min="1"
                value={form.guests}
                onChange={(event) =>
                  setForm({
                    ...form,
                    guests:
                      event.target.value,
                  })
                }
                placeholder="Ex. 150"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Message
            </label>

            <textarea
              rows={6}
              value={form.message}
              onChange={(event) =>
                setForm({
                  ...form,
                  message:
                    event.target.value,
                })
              }
              placeholder="Décrivez votre événement ou vos besoins..."
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            <MessageCircle className="h-5 w-5" />
            Demander le devis sur WhatsApp
          </button>

        </form>
      </section>
    </main>
  );
}
