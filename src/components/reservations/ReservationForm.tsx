"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema } from "@/lib/validations/reservation";
import { z } from "zod";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type ReservationFormData = z.infer<typeof reservationSchema>;

type Client = {
  id: number;
  full_name?: string;
  phone?: string;
  email?: string;
};

type Hall = {
  id: number;
  name: string;
};

interface ReservationFormProps {
  onSubmitSuccess?: () => void;
}

export default function ReservationForm({
  onSubmitSuccess,
}: ReservationFormProps) {
  const [clientMode, setClientMode] = useState<"EXISTING" | "NEW">(
    "EXISTING"
  );

  const [clients, setClients] = useState<Client[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),

    defaultValues: {
      type_evenement: "Mariage",
    },
  });

  // ============================================================
  // CHARGEMENT CLIENTS + SALLES
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setServerError("");

        const [clientsResponse, hallsResponse] = await Promise.all([
          api.get(API_ROUTES.CLIENTS),
          api.get(API_ROUTES.SALLES),
        ]);

        const clientsData = clientsResponse.data;
        const hallsData = hallsResponse.data;

        setClients(
          Array.isArray(clientsData)
            ? clientsData
            : Array.isArray(clientsData?.results)
              ? clientsData.results
              : []
        );

        setHalls(
          Array.isArray(hallsData)
            ? hallsData
            : Array.isArray(hallsData?.results)
              ? hallsData.results
              : []
        );
      } catch (error: any) {
        console.error(
          "Erreur chargement clients/salles :",
          error
        );

        setServerError(
          error?.response?.data?.detail ||
            "Impossible de charger les clients et les salles."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // ============================================================
  // SOUMISSION
  // ============================================================

  const onSubmit = async (data: ReservationFormData) => {
    try {
      setServerError("");
      setSuccessMessage("");

      let clientId: number | string | undefined;

      // ----------------------------------------------------------
      // 1. CLIENT EXISTANT
      // ----------------------------------------------------------

      if (clientMode === "EXISTING") {
        clientId = data.client_id;
      }

      // ----------------------------------------------------------
      // 2. NOUVEAU CLIENT
      // ----------------------------------------------------------

      if (clientMode === "NEW") {
        const nouveauClient = {
          full_name: `${data.nouveau_client?.prenom || ""} ${
            data.nouveau_client?.nom || ""
          }`.trim(),

          phone: data.nouveau_client?.telephone,

          email: data.nouveau_client?.email || "",
        };

        const clientResponse = await api.post(
          API_ROUTES.CLIENTS,
          nouveauClient
        );

        clientId = clientResponse.data.id;
      }

      if (!clientId) {
        throw new Error(
          "Veuillez sélectionner ou créer un client."
        );
      }

      // ----------------------------------------------------------
      // 3. CONSTRUCTION DU PAYLOAD DJANGO
      // ----------------------------------------------------------

      const reservationPayload = {
        client: clientId,

        hall: data.salle_id,

        event_type: data.type_evenement,

        event_date: data.date_evenement,

        start_time: data.heure_debut,

        end_time: data.heure_fin,

        number_of_guests: data.nombre_invites,

        total_amount: data.total_amount,
      };

      console.log(
        "POST /api/reservations/",
        reservationPayload
      );

      // ----------------------------------------------------------
      // 4. ENVOI À DJANGO
      // ----------------------------------------------------------

      const response = await api.post(
        API_ROUTES.RESERVATIONS,
        reservationPayload
      );

      console.log(
        "Réservation créée :",
        response.data
      );

      // ----------------------------------------------------------
      // 5. SUCCÈS
      // ----------------------------------------------------------

      setSuccessMessage(
        "La réservation a été créée avec succès."
      );

      reset();

      onSubmitSuccess?.();
    } catch (error: any) {
      console.error(
        "Erreur lors de la création de la réservation :",
        error
      );

      const data = error?.response?.data;

      // Erreur Django détaillée
      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field} : ${message}`;
          })
          .join(" | ");

        setServerError(
          messages || "Erreur lors de la création."
        );
      } else {
        setServerError(
          error?.message ||
            "Impossible de créer la réservation."
        );
      }
    }
  };

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      {/* ========================================================
          EN-TÊTE
      ======================================================== */}

      <div className="border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">
          Nouvelle réservation
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enregistrez une nouvelle réservation de salle.
        </p>
      </div>

      {/* ========================================================
          CHARGEMENT
      ======================================================== */}

      {loadingData && (
        <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />

          Chargement des clients et des salles...
        </div>
      )}

      {/* ========================================================
          ERREUR
      ======================================================== */}

      {serverError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Impossible d'enregistrer la réservation
            </p>

            <p className="mt-1">
              {serverError}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          SUCCÈS
      ======================================================== */}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5" />

          {successMessage}
        </div>
      )}

      {/* ========================================================
          1. CLIENT
      ======================================================== */}

      <section className="space-y-4">
        <h3 className="text-md font-semibold text-gray-700">
          1. Client
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setClientMode("EXISTING");
              setServerError("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              clientMode === "EXISTING"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Client existant
          </button>

          <button
            type="button"
            onClick={() => {
              setClientMode("NEW");
              setServerError("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              clientMode === "NEW"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Nouveau client
          </button>
        </div>

        {/* ======================================================
            CLIENT EXISTANT
        ====================================================== */}

        {clientMode === "EXISTING" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client *
            </label>

            <select
              {...register("client_id")}
              disabled={loadingData}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                Sélectionner un client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.full_name ||
                    `Client #${client.id}`}
                  {client.phone
                    ? ` — ${client.phone}`
                    : ""}
                </option>
              ))}
            </select>

            {errors.client_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.client_id.message}
              </p>
            )}

            {clients.length === 0 &&
              !loadingData && (
                <p className="mt-2 text-xs text-amber-600">
                  Aucun client enregistré. Utilisez
                  « Nouveau client ».
                </p>
              )}
          </div>
        )}

        {/* ======================================================
            NOUVEAU CLIENT
        ====================================================== */}

        {clientMode === "NEW" && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border bg-gray-50 p-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Nom *
              </label>

              <input
                {...register(
                  "nouveau_client.nom"
                )}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />

              {errors.nouveau_client?.nom && (
                <p className="mt-1 text-xs text-red-600">
                  {
                    errors.nouveau_client.nom
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Prénom *
              </label>

              <input
                {...register(
                  "nouveau_client.prenom"
                )}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />

              {errors.nouveau_client?.prenom && (
                <p className="mt-1 text-xs text-red-600">
                  {
                    errors.nouveau_client.prenom
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Téléphone *
              </label>

              <input
                type="tel"
                {...register(
                  "nouveau_client.telephone"
                )}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />

              {errors.nouveau_client
                ?.telephone && (
                <p className="mt-1 text-xs text-red-600">
                  {
                    errors.nouveau_client
                      .telephone.message
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                {...register(
                  "nouveau_client.email"
                )}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          2. ÉVÉNEMENT
      ======================================================== */}

      <section className="space-y-4 border-t pt-5">
        <h3 className="text-md font-semibold text-gray-700">
          2. Événement
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type d'événement *
            </label>

            <select
              {...register("type_evenement")}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <option value="Mariage">Mariage</option>
              <option value="Anniversaire">
                Anniversaire
              </option>
              <option value="Conférence">
                Conférence
              </option>
              <option value="Réunion">Réunion</option>
              <option value="Baptême">Baptême</option>
              <option value="Cocktail">Cocktail</option>
              <option value="Fête familiale">
                Fête familiale
              </option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de l'événement *
            </label>

            <input
              type="date"
              {...register("date_evenement")}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />

            {errors.date_evenement && (
              <p className="mt-1 text-xs text-red-600">
                {errors.date_evenement.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heure de début *
            </label>

            <input
              type="time"
              {...register("heure_debut")}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />

            {errors.heure_debut && (
              <p className="mt-1 text-xs text-red-600">
                {errors.heure_debut.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heure de fin *
            </label>

            <input
              type="time"
              {...register("heure_fin")}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />

            {errors.heure_fin && (
              <p className="mt-1 text-xs text-red-600">
                {errors.heure_fin.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre d'invités
            </label>

            <input
              type="number"
              min="1"
              {...register(
                "nombre_invites",
                {
                  valueAsNumber: true,
                }
              )}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SALLE ET TARIFICATION
      ======================================================== */}

      <section className="space-y-4 border-t pt-5">
        <h3 className="text-md font-semibold text-gray-700">
          3. Salle et tarification
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salle *
            </label>

            <select
              {...register("salle_id")}
              disabled={loadingData}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">
                Sélectionner une salle
              </option>

              {halls.map((hall) => (
                <option
                  key={hall.id}
                  value={hall.id}
                >
                  {hall.name}
                </option>
              ))}
            </select>

            {errors.salle_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.salle_id.message}
              </p>
            )}

            {halls.length === 0 &&
              !loadingData && (
                <p className="mt-2 text-xs text-amber-600">
                  Aucune salle disponible.
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Montant total ($) *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              {...register(
                "total_amount",
                {
                  valueAsNumber: true,
                }
              )}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />

            {errors.total_amount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.total_amount.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          BOUTON
      ======================================================== */}

      <button
        type="submit"
        disabled={
          isSubmitting || loadingData
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting && (
          <Loader2 className="h-5 w-5 animate-spin" />
        )}

        {isSubmitting
          ? "Enregistrement..."
          : "Créer la réservation"}
      </button>
    </form>
  );
}