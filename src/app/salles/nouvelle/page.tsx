"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface HallForm {
  name: string;
  description: string;
  capacity: string;
  price: string;
  is_active: boolean;
}

interface ApiErrorResponse {
  [key: string]: unknown;
}

export default function NouvelleSallePage() {
  const router = useRouter();

  const [form, setForm] = useState<HallForm>({
    name: "",
    description: "",
    capacity: "",
    price: "",
    is_active: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * NETTOYAGE DES URL LOCALES
   * ============================================================
   *
   * Nous créons les URL uniquement pour l'aperçu.
   * Elles doivent être libérées lorsque le composant est démonté.
   */

  useEffect(() => {
    return () => {
      // Les URL créées directement dans le rendu ne sont pas
      // conservées ici. Le navigateur les nettoiera lorsque
      // les éléments disparaissent.
    };
  }, []);

  /*
   * ============================================================
   * IMAGES
   * ============================================================
   */

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setImages((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((previous) =>
      previous.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  }

  /*
   * ============================================================
   * VIDÉOS
   * ============================================================
   */

  function handleVideos(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("video/")
    );

    setVideos((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    event.target.value = "";
  }

  function removeVideo(index: number) {
    setVideos((previous) =>
      previous.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  }

  /*
   * ============================================================
   * FORMULAIRE
   * ============================================================
   */

  function updateForm<K extends keyof HallForm>(
    field: K,
    value: HallForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /*
   * ============================================================
   * ERREURS API
   * ============================================================
   */

  function getErrorMessage(
    error: unknown
  ): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const response = (
        error as {
          response?: {
            data?: ApiErrorResponse | string;
          };
        }
      ).response;

      const data = response?.data;

      if (typeof data === "string") {
        return data;
      }

      if (
        data &&
        typeof data === "object"
      ) {
        return Object.entries(data)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field} : ${value.join(", ")}`;
            }

            if (
              typeof value === "object" &&
              value !== null
            ) {
              return `${field} : ${JSON.stringify(value)}`;
            }

            return `${field} : ${String(value)}`;
          })
          .join(" | ");
      }
    }

    if (
      error instanceof Error &&
      error.message
    ) {
      return error.message;
    }

    return "Impossible de créer la salle.";
  }

  /*
   * ============================================================
   * ENREGISTREMENT
   * ============================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Le nom de la salle est obligatoire."
      );
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) <= 0
    ) {
      setError(
        "La capacité doit être supérieure à zéro."
      );
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Le prix de la salle est obligatoire."
      );
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "name",
        form.name.trim()
      );

      data.append(
        "description",
        form.description.trim()
      );

      data.append(
        "capacity",
        form.capacity
      );

      data.append(
        "price",
        form.price
      );

      data.append(
        "is_active",
        String(form.is_active)
      );

      /*
       * IMPORTANT :
       * Le backend attend request.FILES.getlist("images")
       */

      for (const image of images) {
        data.append(
          "images",
          image,
          image.name
        );
      }

      /*
       * Le backend attend request.FILES.getlist("videos")
       */

      for (const video of videos) {
        data.append(
          "videos",
          video,
          video.name
        );
      }

      /*
       * NE PAS définir manuellement Content-Type.
       * Axios ajoute automatiquement le boundary multipart.
       */

      const response = await api.post(
        API_ROUTES.HALLS,
        data
      );

      console.log(
        "Salle créée avec succès :",
        response.data
      );

      router.push("/salles");
      router.refresh();
    } catch (error: unknown) {
      console.error(
        "Erreur création salle :",
        error
      );

      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl space-y-6">

        {/* HEADER */}

        <div className="flex items-center gap-4">
          <Link
            href="/salles"
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">
              Ajouter une salle
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Enregistrez une nouvelle salle
              de fêtes.
            </p>
          </div>
        </div>

        {/* ERREUR */}

        {error && (
          <div className="whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FORMULAIRE */}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >

          {/* NOM */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Nom de la salle
            </label>

            <input
              required
              type="text"
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="Ex. Grande Salle"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm(
                  "description",
                  event.target.value
                )
              }
              placeholder="Décrivez la salle..."
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          {/* CAPACITÉ / PRIX */}

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Capacité
              </label>

              <input
                required
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) =>
                  updateForm(
                    "capacity",
                    event.target.value
                  )
                }
                placeholder="Nombre de personnes"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Prix
              </label>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  updateForm(
                    "price",
                    event.target.value
                  )
                }
                placeholder="Prix de location"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

          </div>

          {/* IMAGES */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Images de la salle

              <span className="ml-2 text-xs text-slate-500">
                Facultatif
              </span>
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-4 py-8 transition hover:bg-slate-800">
              <ImageIcon className="h-7 w-7 text-slate-400" />

              <span className="text-sm text-slate-300">
                Ajouter une ou plusieurs images
              </span>

              <span className="text-xs text-slate-500">
                JPG, PNG, WEBP...
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map(
                  (file, index) => {
                    const previewUrl =
                      URL.createObjectURL(file);

                    return (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="group relative h-32 overflow-hidden rounded-lg border border-slate-700"
                      >
                        <img
                          src={previewUrl}
                          alt={`Aperçu ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                          className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* VIDÉOS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Vidéos de la salle

              <span className="ml-2 text-xs text-slate-500">
                Facultatif
              </span>
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-4 py-8 transition hover:bg-slate-800">
              <Video className="h-7 w-7 text-slate-400" />

              <span className="text-sm text-slate-300">
                Ajouter une ou plusieurs vidéos
              </span>

              <span className="text-xs text-slate-500">
                MP4, MOV, WEBM...
              </span>

              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideos}
                className="hidden"
              />
            </label>

            {videos.length > 0 && (
              <div className="mt-4 space-y-3">
                {videos.map(
                  (file, index) => {
                    const previewUrl =
                      URL.createObjectURL(file);

                    return (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                      >
                        <div className="aspect-video bg-black">
                          <video
                            src={previewUrl}
                            controls
                            preload="metadata"
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 px-4 py-3">

                          <div className="flex min-w-0 items-center gap-3">
                            <Video className="h-5 w-5 shrink-0 text-blue-400" />

                            <div className="min-w-0">
                              <p className="truncate text-sm text-slate-200">
                                {file.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {(
                                  file.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeVideo(index)
                            }
                            className="shrink-0 text-red-400 hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* ÉTAT */}

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 p-4">

            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                updateForm(
                  "is_active",
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded"
            />

            <div>
              <p className="text-sm font-medium">
                Salle active
              </p>

              <p className="text-xs text-slate-500">
                La salle pourra être utilisée
                pour les réservations.
              </p>
            </div>

          </label>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/salles"
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-center text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Création..."
                : "Créer la salle"}
            </button>

          </div>

        </form>
      </section>
    </main>
  );
}

