"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Save,
  AlertCircle,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

/* ============================================================
   TYPES
============================================================ */

interface HallMedia {
  id: number;
  url: string;
  name?: string | null;
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

/* ============================================================
   URL DES MÉDIAS
============================================================ */

function getMediaUrl(url: string): string {
  if (!url) {
    return "";
  }

  /*
   * Django peut déjà renvoyer une URL absolue :
   * http://127.0.0.1:8000/media/...
   */
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  /*
   * Sinon on construit l'URL complète.
   */
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  return `${apiBaseUrl.replace(/\/+$/, "")}/${url.replace(
    /^\/+/,
    ""
  )}`;
}

/* ============================================================
   PAGE
============================================================ */

export default function ModifierSallePage() {
  const router = useRouter();

  const params = useParams<{ id: string }>();

  const id = String(params.id);

  /* ==========================================================
     ÉTAT FORMULAIRE
  ========================================================== */

  const [form, setForm] = useState<HallForm>({
    name: "",
    description: "",
    capacity: "",
    price: "",
    is_active: true,
  });

  /* ==========================================================
     SALLE
  ========================================================== */

  const [hall, setHall] = useState<Hall | null>(null);

  /* ==========================================================
     MÉDIAS EXISTANTS
  ========================================================== */

  const [existingImages, setExistingImages] =
    useState<HallMedia[]>([]);

  const [existingVideos, setExistingVideos] =
    useState<HallMedia[]>([]);

  /*
   * IDs des médias que l'utilisateur veut supprimer.
   */
  const [deletedImageIds, setDeletedImageIds] =
    useState<number[]>([]);

  const [deletedVideoIds, setDeletedVideoIds] =
    useState<number[]>([]);

  /* ==========================================================
     NOUVEAUX MÉDIAS
  ========================================================== */

  const [newImages, setNewImages] =
    useState<File[]>([]);

  const [newVideos, setNewVideos] =
    useState<File[]>([]);

  /* ==========================================================
     ÉTATS
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     PRÉVISUALISATIONS DES NOUVELLES IMAGES
  ========================================================== */

  const imagePreviews = useMemo(() => {
    return newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [newImages]);

  /* ==========================================================
     PRÉVISUALISATIONS DES NOUVELLES VIDÉOS
  ========================================================== */

  const videoPreviews = useMemo(() => {
    return newVideos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [newVideos]);

  /*
   * Nettoyage des ObjectURL.
   */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });

      videoPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews, videoPreviews]);

  /* ==========================================================
     CHARGEMENT DE LA SALLE
  ========================================================== */

  useEffect(() => {
    async function loadHall() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `${API_ROUTES.HALLS}${id}/`
        );

        const data = response.data as Hall;

        setHall(data);

        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          capacity:
            data.capacity != null
              ? String(data.capacity)
              : "",
          price:
            data.price != null
              ? String(data.price)
              : "",
          is_active:
            data.is_active !== false,
        });

        setExistingImages(
          Array.isArray(data.images)
            ? data.images
            : []
        );

        setExistingVideos(
          Array.isArray(data.videos)
            ? data.videos
            : []
        );
      } catch (err: unknown) {
        console.error(
          "Erreur chargement salle :",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Impossible de charger cette salle."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadHall();
    }
  }, [id]);

  /* ==========================================================
     MISE À JOUR DU FORMULAIRE
  ========================================================== */

  function updateForm<K extends keyof HallForm>(
    field: K,
    value: HallForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* ==========================================================
     AJOUT IMAGES
  ========================================================== */

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/")
    );

    setNewImages((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    /*
     * Permet de sélectionner à nouveau le même fichier.
     */
    event.target.value = "";
  }

  /* ==========================================================
     SUPPRESSION NOUVELLE IMAGE
  ========================================================== */

  function removeNewImage(index: number) {
    setNewImages((previous) =>
      previous.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  /* ==========================================================
     AJOUT VIDÉOS
  ========================================================== */

  function handleVideos(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).filter(
      (file) => file.type.startsWith("video/")
    );

    setNewVideos((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    event.target.value = "";
  }

  /* ==========================================================
     SUPPRESSION NOUVELLE VIDÉO
  ========================================================== */

  function removeNewVideo(index: number) {
    setNewVideos((previous) =>
      previous.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  /* ==========================================================
     SUPPRESSION IMAGE EXISTANTE
  ========================================================== */

  function deleteExistingImage(id: number) {
    setDeletedImageIds((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      return [...previous, id];
    });

    setExistingImages((previous) =>
      previous.filter(
        (image) => image.id !== id
      )
    );
  }

  /* ==========================================================
     SUPPRESSION VIDÉO EXISTANTE
  ========================================================== */

  function deleteExistingVideo(id: number) {
    setDeletedVideoIds((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      return [...previous, id];
    });

    setExistingVideos((previous) =>
      previous.filter(
        (video) => video.id !== id
      )
    );
  }

  /* ==========================================================
     ANNULER SUPPRESSION IMAGE
  ========================================================== */

  function restoreImage(
    imageId: number
  ) {
    if (!hall?.images) {
      return;
    }

    const originalImage =
      hall.images.find(
        (image) => image.id === imageId
      );

    if (!originalImage) {
      return;
    }

    setDeletedImageIds((previous) =>
      previous.filter(
        (id) => id !== imageId
      )
    );

    setExistingImages((previous) => [
      ...previous,
      originalImage,
    ]);
  }

  /* ==========================================================
     ANNULER SUPPRESSION VIDÉO
  ========================================================== */

  function restoreVideo(
    videoId: number
  ) {
    if (!hall?.videos) {
      return;
    }

    const originalVideo =
      hall.videos.find(
        (video) => video.id === videoId
      );

    if (!originalVideo) {
      return;
    }

    setDeletedVideoIds((previous) =>
      previous.filter(
        (id) => id !== videoId
      )
    );

    setExistingVideos((previous) => [
      ...previous,
      originalVideo,
    ]);
  }

  /* ==========================================================
     MESSAGE ERREUR API
  ========================================================== */

  function getErrorMessage(
    error: unknown,
    fallback = "Une erreur est survenue."
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
              return `${field} : ${value.join(
                ", "
              )}`;
            }

            if (
              typeof value === "object" &&
              value !== null
            ) {
              return `${field} : ${JSON.stringify(
                value
              )}`;
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

    return fallback;
  }

  /* ==========================================================
     ENREGISTREMENT
  ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

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
      setSaving(true);

      /*
       * ======================================================
       * FORM DATA
       * ======================================================
       */

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
       * ======================================================
       * NOUVELLES IMAGES
       * ======================================================
       */

      for (const image of newImages) {
        data.append(
          "images",
          image,
          image.name
        );
      }

      /*
       * ======================================================
       * NOUVELLES VIDÉOS
       * ======================================================
       */

      for (const video of newVideos) {
        data.append(
          "videos",
          video,
          video.name
        );
      }

      /*
       * ======================================================
       * MÉDIAS À SUPPRIMER
       *
       * Le backend pourra récupérer :
       *
       * request.data.getlist("deleted_image_ids")
       * request.data.getlist("deleted_video_ids")
       *
       * ======================================================
       */

      for (const imageId of deletedImageIds) {
        data.append(
          "deleted_image_ids",
          String(imageId)
        );
      }

      for (const videoId of deletedVideoIds) {
        data.append(
          "deleted_video_ids",
          String(videoId)
        );
      }

      /*
       * IMPORTANT :
       *
       * On ne définit PAS manuellement
       * Content-Type.
       *
       * Axios doit créer lui-même le boundary.
       */

      const response = await api.patch(
        `${API_ROUTES.HALLS}${id}/`,
        data
      );

      console.log(
        "Salle modifiée avec succès :",
        response.data
      );

      setSuccess(
        "La salle a été modifiée avec succès."
      );

      /*
       * Retour à la liste après une courte pause
       * afin que l'utilisateur voie le message.
       */
      setTimeout(() => {
        router.push("/salles");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error(
        "Erreur modification salle :",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de modifier la salle."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />

            <p className="text-sm text-slate-400">
              Chargement de la salle...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     ERREUR / SALLE INTROUVABLE
  ========================================================== */

  if (!hall) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/salles"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux salles
          </Link>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p>
              {error ||
                "Salle introuvable."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     AFFICHAGE
  ========================================================== */

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center gap-4">
          <Link
            href="/salles"
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Modifier la salle
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Modifiez les informations et
              les médias de « {hall.name} ».
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERREUR */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* ================================================== */}
        {/* SUCCÈS */}
        {/* ================================================== */}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* ================================================== */}
        {/* FORMULAIRE */}
        {/* ================================================== */}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >

          {/* =================================================
              INFORMATIONS
          ================================================= */}

          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">
                Informations de la salle
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informations générales utilisées
                pour présenter la salle.
              </p>
            </div>

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
                rows={6}
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
          </section>

          {/* =================================================
              IMAGES EXISTANTES
          ================================================= */}

          <section className="space-y-4 border-t border-slate-800 pt-8">

            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-400" />

              <div>
                <h2 className="text-lg font-semibold">
                  Images existantes
                </h2>

                <p className="text-sm text-slate-500">
                  Supprimez les images que vous
                  ne souhaitez plus conserver.
                </p>
              </div>
            </div>

            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                {existingImages.map(
                  (image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                    >
                      <img
                        src={getMediaUrl(
                          image.url
                        )}
                        alt={
                          image.name ||
                          hall.name
                        }
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          deleteExistingImage(
                            image.id
                          )
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-500"
                        title="Supprimer cette image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {image.name && (
                        <p className="truncate px-3 py-2 text-xs text-slate-400">
                          {image.name}
                        </p>
                      )}
                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-8 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-slate-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Aucune image existante.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              AJOUT NOUVELLES IMAGES
          ================================================= */}

          <section className="space-y-4">

            <div>
              <h2 className="text-lg font-semibold">
                Ajouter des images
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Les images sélectionnées seront
                ajoutées aux images existantes.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-4 py-8 transition hover:bg-slate-800">
              <ImageIcon className="h-8 w-8 text-slate-400" />

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

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                {imagePreviews.map(
                  (preview, index) => (
                    <div
                      key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-blue-500/30 bg-slate-800"
                    >
                      <img
                        src={preview.url}
                        alt={`Nouvelle image ${
                          index + 1
                        }`}
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-500"
                        title="Retirer"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <p className="truncate px-3 py-2 text-xs text-slate-400">
                        {preview.file.name}
                      </p>
                    </div>
                  )
                )}

              </div>
            )}
          </section>

          {/* =================================================
              VIDÉOS EXISTANTES
          ================================================= */}

          <section className="space-y-4 border-t border-slate-800 pt-8">

            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-400" />

              <div>
                <h2 className="text-lg font-semibold">
                  Vidéos existantes
                </h2>

                <p className="text-sm text-slate-500">
                  Supprimez les vidéos qui ne
                  doivent plus être présentées.
                </p>
              </div>
            </div>

            {existingVideos.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">

                {existingVideos.map(
                  (video) => (
                    <div
                      key={video.id}
                      className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                    >
                      <div className="relative aspect-video bg-black">

                        <video
                          src={getMediaUrl(
                            video.url
                          )}
                          controls
                          preload="metadata"
                          className="h-full w-full object-contain"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            deleteExistingVideo(
                              video.id
                            )
                          }
                          className="absolute right-2 top-2 z-10 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-500"
                          title="Supprimer cette vidéo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {video.name && (
                        <p className="truncate px-4 py-3 text-sm text-slate-400">
                          {video.name}
                        </p>
                      )}
                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-8 text-center">
                <Video className="mx-auto h-8 w-8 text-slate-600" />

                <p className="mt-3 text-sm text-slate-500">
                  Aucune vidéo existante.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              AJOUT NOUVELLES VIDÉOS
          ================================================= */}

          <section className="space-y-4">

            <div>
              <h2 className="text-lg font-semibold">
                Ajouter des vidéos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Les vidéos sélectionnées seront
                ajoutées aux vidéos existantes.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-4 py-8 transition hover:bg-slate-800">
              <Video className="h-8 w-8 text-slate-400" />

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

            {videoPreviews.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">

                {videoPreviews.map(
                  (preview, index) => (
                    <div
                      key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                      className="overflow-hidden rounded-xl border border-blue-500/30 bg-slate-800"
                    >
                      <div className="relative aspect-video bg-black">

                        <video
                          src={preview.url}
                          controls
                          preload="metadata"
                          className="h-full w-full object-contain"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewVideo(
                              index
                            )
                          }
                          className="absolute right-2 top-2 z-10 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-500"
                          title="Retirer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3">
                        <Video className="h-5 w-5 shrink-0 text-blue-400" />

                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">
                            {preview.file.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {(
                              preview.file.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

              </div>
            )}
          </section>

          {/* =================================================
              RÉSUMÉ
          ================================================= */}

          <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

            <h3 className="text-sm font-semibold text-slate-200">
              Résumé des modifications
            </h3>

            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-500">
                  Images conservées
                </p>

                <p className="mt-1 font-semibold">
                  {existingImages.length}
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-500">
                  Nouvelles images
                </p>

                <p className="mt-1 font-semibold">
                  {newImages.length}
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-500">
                  Vidéos conservées
                </p>

                <p className="mt-1 font-semibold">
                  {existingVideos.length}
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-xs text-slate-500">
                  Nouvelles vidéos
                </p>

                <p className="mt-1 font-semibold">
                  {newVideos.length}
                </p>
              </div>

            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

            <Link
              href="/salles"
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>

          </div>

        </form>
      </section>
    </main>
  );
}

