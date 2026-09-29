"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  FileText,
  Users,
  Image as ImageIcon,
  Video,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface HallMedia {
  id: number;
  url: string;
  name?: string;
}

interface Hall {
  id: number;
  name: string;
  description?: string | null;
  capacity?: number | null;
  price?: number | string | null;
  is_active?: boolean;
  images?: HallMedia[];
  videos?: HallMedia[];
}

/*
 * ============================================================
 * URL DES MÉDIAS
 * ============================================================
 */

function getMediaUrl(url: string): string {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  return `${apiBaseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

/*
 * ============================================================
 * WHATSAPP
 * ============================================================
 */

function getWhatsAppUrl(
  hall: Hall
): string {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!number) {
    return "#";
  }

  const cleanNumber =
    number.replace(/\D/g, "");

  if (!cleanNumber) {
    return "#";
  }

  const message =
    `Bonjour La Casa da Festa Elisabeth.\n\n` +
    `Je souhaite avoir des informations concernant ` +
    `la salle « ${hall.name} ».\n\n` +
    `Pouvez-vous me renseigner sur les disponibilités ` +
    `et les conditions de location ?`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message
  )}`;
}

export default function SalleDetailsPage() {
  const params =
    useParams<{ id: string }>();

  const id = String(params.id);

  const [hall, setHall] =
    useState<Hall | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  useEffect(() => {
    async function loadHall() {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `${API_ROUTES.HALLS}${id}/`
          );

        setHall(response.data);
      } catch (error) {
        console.error(
          "Erreur chargement salle :",
          error
        );

        setError(
          "Impossible de charger les informations de cette salle."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadHall();
    }
  }, [id]);

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-400" />

            <p className="mt-4 text-slate-400">
              Chargement de la salle...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * ERREUR
   * ============================================================
   */

  if (!hall || error) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">

        <div className="mx-auto max-w-4xl">

          <Link
            href="/salles"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux salles
          </Link>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">

            <AlertCircle className="h-5 w-5 shrink-0" />

            <span>
              {error ||
                "Salle introuvable."}
            </span>

          </div>

        </div>

      </main>
    );
  }

  const images =
    hall.images ?? [];

  const videos =
    hall.videos ?? [];

  const whatsappUrl =
    getWhatsAppUrl(hall);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl space-y-8">

        {/* RETOUR */}

        <Link
          href="/salles"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux salles
        </Link>

        {/* HEADER */}

        <section>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-400">
                Salle de fêtes
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {hall.name}
              </h1>

            </div>

            {hall.is_active === false && (
              <span className="inline-flex w-fit rounded-full bg-red-500/10 px-3 py-1.5 text-sm text-red-400">
                Actuellement indisponible
              </span>
            )}

          </div>

        </section>

        {/* GALERIE IMAGES */}

        {images.length > 0 && (
          <section>

            <div className="mb-4 flex items-center gap-2">

              <ImageIcon className="h-5 w-5 text-blue-400" />

              <h2 className="text-xl font-semibold">
                Photos de la salle
              </h2>

            </div>

            <div
              className={
                images.length === 1
                  ? "overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                  : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }
            >

              {images.map(
                (image) => {

                  const imageUrl =
                    getMediaUrl(
                      image.url
                    );

                  return (
                    <a
                      key={image.id}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                    >

                      <img
                        src={imageUrl}
                        alt={
                          image.name ||
                          hall.name
                        }
                        className={
                          images.length === 1
                            ? "max-h-[600px] w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                            : "h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                        }
                      />

                    </a>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* VIDÉOS */}

        {videos.length > 0 && (
          <section>

            <div className="mb-4 flex items-center gap-2">

              <Video className="h-5 w-5 text-blue-400" />

              <h2 className="text-xl font-semibold">
                Vidéos de la salle
              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {videos.map(
                (video) => {

                  const videoUrl =
                    getMediaUrl(
                      video.url
                    );

                  return (
                    <div
                      key={video.id}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                    >

                      <video
                        src={videoUrl}
                        controls
                        preload="metadata"
                        className="aspect-video w-full bg-black"
                      />

                      {video.name && (
                        <p className="px-4 py-3 text-sm text-slate-400">
                          {video.name}
                        </p>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* INFORMATIONS */}

        <section className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <Users className="h-6 w-6 text-blue-400" />

            <p className="mt-4 text-sm text-slate-400">
              Capacité
            </p>

            <p className="mt-1 text-xl font-semibold">
              {hall.capacity != null
                ? `${hall.capacity} personnes`
                : "Sur demande"}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <FileText className="h-6 w-6 text-blue-400" />

            <p className="mt-4 text-sm text-slate-400">
              Tarif indicatif
            </p>

            <p className="mt-1 text-xl font-semibold">
              {hall.price != null
                ? `${Number(
                    hall.price
                  ).toLocaleString(
                    "fr-FR"
                  )} $`
                : "Sur demande"}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <ImageIcon className="h-6 w-6 text-blue-400" />

            <p className="mt-4 text-sm text-slate-400">
              Présentation
            </p>

            <p className="mt-1 text-xl font-semibold">
              {images.length} photo(s)
              {" • "}
              {videos.length} vidéo(s)
            </p>

          </div>

        </section>

        {/* DESCRIPTION */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            À propos de cette salle
          </h2>

          <p className="mt-4 whitespace-pre-line leading-7 text-slate-300">
            {hall.description ||
              "Aucune description détaillée n'a encore été renseignée pour cette salle."}
          </p>

        </section>

        {/* ACTIONS */}

        <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

          <h2 className="text-xl font-semibold">
            Vous êtes intéressé par cette salle ?
          </h2>

          <p className="mt-2 text-slate-400">
            Demandez un devis ou contactez
            directement notre équipe sur
            WhatsApp pour discuter de votre
            événement.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <Link
              href={`/demande-devis?salle=${hall.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              <FileText className="h-5 w-5" />
              Demander un devis
            </Link>

            {whatsappUrl !== "#" ? (

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
              >
                <MessageCircle className="h-5 w-5" />
                Discuter sur WhatsApp
              </a>

            ) : (

              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm text-slate-400">
                WhatsApp non configuré
              </span>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}

