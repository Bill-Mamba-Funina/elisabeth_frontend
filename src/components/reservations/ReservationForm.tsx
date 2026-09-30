"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Loader2,
  Save,
  UserPlus,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

// ============================================================
// TYPES
// ============================================================

interface Client {
  id: number | string;
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Hall {
  id: number | string;
  name?: string;
  nom?: string;
  capacity?: number;
  capacite?: number;
  is_active?: boolean;
  active?: boolean;
}

interface Tarif {
  id: number | string;
  name?: string;
  nom?: string;
  amount?: number | string;
  montant?: number | string;
  active?: boolean;
  is_active?: boolean;
}

interface Reservation {
  id?: number | string;
  reservation_number?: string;
  reference?: string;

  client?: number | string | Client | null;

  hall?: number | string | Hall | null;
  salle?: number | string | Hall | null;

  tarif?: number | string | Tarif | null;

  event_type?: string;

  event_date?: string;
  start_time?: string;
  end_time?: string;

  guest_count?: number;
  number_of_guests?: number;

  status?: string;

  total_amount?: number | string;
  amount_paid?: number | string;
  remaining_amount?: number | string;
  payment_status?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

interface ReservationFormProps {
  reservation?: Reservation | null;
  onSuccess?: (reservation: Reservation) => void;
  redirectAfterSave?: boolean;
}

interface ApiErrorShape {
  detail?: string;
  message?: string;
  error?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

// ============================================================
// HELPERS
// ============================================================

function normalizeList<T>(
  data: T[] | PaginatedResponse<T>,
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.results)
  ) {
    return data.results;
  }

  return [];
}

function getClientName(
  client: Client,
): string {
  if (client.full_name) {
    return client.full_name;
  }

  if (client.name) {
    return client.name;
  }

  return [
    client.first_name,
    client.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getHallName(
  hall: Hall,
): string {
  return (
    hall.name ||
    hall.nom ||
    `Salle #${hall.id}`
  );
}

function getTarifName(
  tarif: Tarif,
): string {
  return (
    tarif.name ||
    tarif.nom ||
    `Tarif #${tarif.id}`
  );
}

function getTarifAmount(
  tarif: Tarif,
): number {
  return Number(
    tarif.amount ??
      tarif.montant ??
      0,
  );
}

function extractApiError(
  error: unknown,
): string {
  const axiosError =
    error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

  const status =
    axiosError.response?.status;

  const data =
    axiosError.response?.data;

  // ----------------------------------------------------------
  // Texte brut
  // ----------------------------------------------------------

  if (typeof data === "string") {
    return data;
  }

  // ----------------------------------------------------------
  // JSON Django / DRF
  // ----------------------------------------------------------

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const typedData =
      data as ApiErrorShape;

    if (typedData.detail) {
      return String(
        typedData.detail,
      );
    }

    if (typedData.message) {
      return String(
        typedData.message,
      );
    }

    if (typedData.error) {
      return String(
        typedData.error,
      );
    }

    if (
      Array.isArray(
        typedData.non_field_errors,
      )
    ) {
      return typedData.non_field_errors.join(
        " | ",
      );
    }

    const messages =
      Object.entries(typedData)
        .map(
          ([field, value]) => {
            if (
              Array.isArray(value)
            ) {
              return `${field} : ${value.join(
                ", ",
              )}`;
            }

            if (
              typeof value ===
                "object" &&
              value !== null
            ) {
              return `${field} : ${JSON.stringify(
                value,
              )}`;
            }

            return `${field} : ${String(
              value,
            )}`;
          },
        )
        .filter(Boolean);

    if (
      messages.length > 0
    ) {
      return messages.join(
        " | ",
      );
    }
  }

  if (status === 400) {
    return "Les données de la réservation sont invalides. Vérifiez les champs du formulaire.";
  }

  if (status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }

  if (status === 403) {
    return "Vous n'avez pas l'autorisation de créer cette réservation.";
  }

  if (status === 404) {
    return "Une ressource sélectionnée est introuvable. Vérifiez le client, la salle ou le tarif.";
  }

  if (status === 500) {
    return (
      "Erreur interne du serveur Django lors de la création de la réservation. " +
      "Consultez le terminal Django pour voir l'exception exacte."
    );
  }

  return (
    axiosError.message ||
    "Impossible de créer la réservation."
  );
}

// ============================================================
// FORMULAIRE
// ============================================================

export default function ReservationForm({
  reservation = null,
  onSuccess,
  redirectAfterSave = true,
}: ReservationFormProps) {
  const router = useRouter();

  const isEdit =
    Boolean(reservation?.id);

  // ==========================================================
  // DONNÉES
  // ==========================================================

  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  const [
    halls,
    setHalls,
  ] = useState<Hall[]>([]);

  const [
    tarifs,
    setTarifs,
  ] = useState<Tarif[]>([]);

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ==========================================================
  // CLIENT
  // ==========================================================

  const [
    clientId,
    setClientId,
  ] = useState("");

  const [
    clientFullName,
    setClientFullName,
  ] = useState("");

  const [
    clientPhone,
    setClientPhone,
  ] = useState("");

  const [
    clientEmail,
    setClientEmail,
  ] = useState("");

  const [
    clientAddress,
    setClientAddress,
  ] = useState("");

  // ==========================================================
  // RÉSERVATION
  // ==========================================================

  const [
    hallId,
    setHallId,
  ] = useState("");

  const [
    tarifId,
    setTarifId,
  ] = useState("");

  const [
    eventDate,
    setEventDate,
  ] = useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("");

  const [
    endTime,
    setEndTime,
  ] = useState("");

  const [
    guestCount,
    setGuestCount,
  ] = useState("");

  // ==========================================================
  // CHARGEMENT CLIENTS / SALLES / TARIFS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        const [
          clientsResponse,
          hallsResponse,
          tarifsResponse,
        ] = await Promise.all([
          api.get<
            Client[] |
              PaginatedResponse<Client>
          >(
            `${API_ROUTES.CLIENTS}?page_size=1000`,
          ),

          api.get<
            Hall[] |
              PaginatedResponse<Hall>
          >(
            `${API_ROUTES.HALLS}?page_size=1000`,
          ),

          api.get<
            Tarif[] |
              PaginatedResponse<Tarif>
          >(
            `${API_ROUTES.TARIFS}?page_size=1000`,
          ),
        ]);

        if (!mounted) {
          return;
        }

        setClients(
          normalizeList(
            clientsResponse.data,
          ),
        );

        setHalls(
          normalizeList(
            hallsResponse.data,
          ),
        );

        setTarifs(
          normalizeList(
            tarifsResponse.data,
          ),
        );
      } catch (err: unknown) {
        console.error(
          "Erreur chargement formulaire réservation :",
          err,
        );

        if (mounted) {
          setError(
            extractApiError(err),
          );
        }
      } finally {
        if (mounted) {
          setLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // INITIALISATION MODIFICATION
  // ==========================================================

  useEffect(() => {
    if (!reservation) {
      return;
    }

    // --------------------------------------------------------
    // CLIENT
    // --------------------------------------------------------

    if (
      reservation.client !== null &&
      reservation.client !== undefined
    ) {
      if (
        typeof reservation.client !==
        "object"
      ) {
        setClientId(
          String(
            reservation.client,
          ),
        );
      } else {
        setClientId(
          String(
            reservation.client.id,
          ),
        );

        setClientFullName(
          getClientName(
            reservation.client,
          ),
        );

        setClientPhone(
          reservation.client.phone ||
            "",
        );

        setClientEmail(
          reservation.client.email ||
            "",
        );

        setClientAddress(
          reservation.client.address ||
            "",
        );
      }
    }

    // --------------------------------------------------------
    // SALLE
    // --------------------------------------------------------

    const reservationHall =
      reservation.hall ??
      reservation.salle;

    if (
      reservationHall !== null &&
      reservationHall !== undefined
    ) {
      if (
        typeof reservationHall !==
        "object"
      ) {
        setHallId(
          String(
            reservationHall,
          ),
        );
      } else {
        setHallId(
          String(
            reservationHall.id,
          ),
        );
      }
    }

    // --------------------------------------------------------
    // TARIF
    // --------------------------------------------------------

    if (
      reservation.tarif !== null &&
      reservation.tarif !== undefined
    ) {
      if (
        typeof reservation.tarif !==
        "object"
      ) {
        setTarifId(
          String(
            reservation.tarif,
          ),
        );
      } else {
        setTarifId(
          String(
            reservation.tarif.id,
          ),
        );
      }
    }

    // --------------------------------------------------------
    // DATE / HORAIRES
    // --------------------------------------------------------

    setEventDate(
      reservation.event_date ||
        "",
    );

    setStartTime(
      reservation.start_time ||
        "",
    );

    setEndTime(
      reservation.end_time ||
        "",
    );

    // --------------------------------------------------------
    // NOMBRE DE PERSONNES
    // --------------------------------------------------------

    const guests =
      reservation.guest_count ??
      reservation.number_of_guests;

    if (
      guests !== undefined &&
      guests !== null
    ) {
      setGuestCount(
        String(guests),
      );
    }
  }, [reservation]);

  // ==========================================================
  // CLIENT SÉLECTIONNÉ
  // ==========================================================

  function handleClientChange(
    value: string,
  ) {
    setClientId(value);

    const client =
      clients.find(
        (item) =>
          String(item.id) ===
          value,
      );

    if (!client) {
      setClientFullName("");
      setClientPhone("");
      setClientEmail("");
      setClientAddress("");
      return;
    }

    setClientFullName(
      getClientName(client),
    );

    setClientPhone(
      client.phone || "",
    );

    setClientEmail(
      client.email || "",
    );

    setClientAddress(
      client.address || "",
    );
  }

  // ==========================================================
  // TARIF SÉLECTIONNÉ
  // ==========================================================

  const selectedTarif =
    tarifs.find(
      (tarif) =>
        String(tarif.id) ===
        tarifId,
    );

  // ==========================================================
  // ENREGISTREMENT
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // VALIDATIONS
    // --------------------------------------------------------

    if (
      !clientId &&
      !clientFullName.trim()
    ) {
      setError(
        "Veuillez sélectionner un client ou renseigner le nom du client.",
      );
      return;
    }

    if (!clientPhone.trim()) {
      setError(
        "Le numéro de téléphone du client est obligatoire.",
      );
      return;
    }

    if (!hallId) {
      setError(
        "Veuillez sélectionner une salle.",
      );
      return;
    }

    if (!tarifId) {
      setError(
        "Veuillez sélectionner un tarif.",
      );
      return;
    }

    if (!eventDate) {
      setError(
        "Veuillez sélectionner la date de l'événement.",
      );
      return;
    }

    if (!startTime) {
      setError(
        "Veuillez renseigner l'heure de début.",
      );
      return;
    }

    if (!endTime) {
      setError(
        "Veuillez renseigner l'heure de fin.",
      );
      return;
    }

    if (startTime >= endTime) {
      setError(
        "L'heure de fin doit être postérieure à l'heure de début.",
      );
      return;
    }

    const guests =
      Number(
        guestCount || 0,
      );

    if (
      !Number.isFinite(guests) ||
      guests < 1
    ) {
      setError(
        "Le nombre de personnes doit être supérieur ou égal à 1.",
      );
      return;
    }

    // --------------------------------------------------------
    // PAYLOAD
    //
    // total_amount et event_type ne sont PAS envoyés.
    // Django les détermine à partir du tarif.
    // --------------------------------------------------------

    const payload = {
      client: clientId
        ? Number(clientId)
        : null,

      client_full_name:
        clientFullName.trim(),

      client_phone:
        clientPhone.trim(),

      client_email:
        clientEmail.trim(),

      client_address:
        clientAddress.trim(),

      hall: Number(hallId),

      tarif: Number(tarifId),

      event_date: eventDate,

      start_time: startTime,

      end_time: endTime,

      guest_count: guests,
    };

    console.log(
      "Payload réservation envoyé à Django :",
      payload,
    );

    try {
      setSaving(true);

      let response;

      // ------------------------------------------------------
      // MODIFICATION
      // ------------------------------------------------------

      if (
        isEdit &&
        reservation?.id
      ) {
        response =
          await api.patch(
            `${API_ROUTES.RESERVATIONS}${reservation.id}/`,
            payload,
          );
      } else {
        // ----------------------------------------------------
        // CRÉATION
        // ----------------------------------------------------

        response =
          await api.post(
            API_ROUTES.RESERVATIONS,
            payload,
          );
      }

      const savedReservation =
        response.data as Reservation;

      console.log(
        isEdit
          ? "Réservation modifiée :"
          : "Réservation créée :",
        savedReservation,
      );

      setSuccess(
        isEdit
          ? "Réservation modifiée avec succès."
          : "Réservation créée avec succès.",
      );

      onSuccess?.(
        savedReservation,
      );

      if (
        redirectAfterSave
      ) {
        window.setTimeout(() => {
          router.push(
            "/reservations",
          );

          router.refresh();
        }, 500);
      }
    } catch (err: unknown) {
      console.error(
        "Erreur création/modification réservation :",
        err,
      );

      setError(
        extractApiError(err),
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          Chargement du formulaire...
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ======================================================
          ERREUR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Erreur
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          SUCCÈS
      ====================================================== */}

      {success && (
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* ======================================================
          CLIENT
      ====================================================== */}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-950/50 p-2 text-blue-400">
            <UserPlus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Client
            </h2>

            <p className="text-sm text-slate-400">
              Le client est associé directement à la réservation.
            </p>
          </div>
        </div>

        {/* CLIENT EXISTANT */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Client existant
          </label>

          <select
            value={clientId}
            onChange={(event) =>
              handleClientChange(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">
              Nouveau client / saisie manuelle
            </option>

            {clients.map(
              (client) => (
                <option
                  key={client.id}
                  value={String(
                    client.id,
                  )}
                >
                  {getClientName(
                    client,
                  ) ||
                    `Client #${client.id}`}
                  {client.phone
                    ? ` — ${client.phone}`
                    : ""}
                </option>
              ),
            )}
          </select>
        </div>

        {/* INFOS CLIENT */}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nom complet *
            </label>

            <input
              type="text"
              value={
                clientFullName
              }
              onChange={(event) =>
                setClientFullName(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Nom complet du client"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Téléphone *
            </label>

            <input
              type="tel"
              value={
                clientPhone
              }
              onChange={(event) =>
                setClientPhone(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              placeholder="+243..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={
                clientEmail
              }
              onChange={(event) =>
                setClientEmail(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              placeholder="client@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Adresse
            </label>

            <input
              type="text"
              value={
                clientAddress
              }
              onChange={(event) =>
                setClientAddress(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Adresse du client"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          RÉSERVATION
      ====================================================== */}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-5 font-semibold text-white">
          Informations de réservation
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* SALLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Salle *
            </label>

            <select
              value={hallId}
              onChange={(event) =>
                setHallId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Sélectionner une salle
              </option>

              {halls
                .filter(
                  (hall) =>
                    hall.is_active !==
                      false &&
                    hall.active !==
                      false,
                )
                .map(
                  (hall) => (
                    <option
                      key={hall.id}
                      value={String(
                        hall.id,
                      )}
                    >
                      {getHallName(
                        hall,
                      )}
                      {(
                        hall.capacity ??
                        hall.capacite
                      )
                        ? ` — capacité ${
                            hall.capacity ??
                            hall.capacite
                          }`
                        : ""}
                    </option>
                  ),
                )}
            </select>
          </div>

          {/* TARIF */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Tarif *
            </label>

            <select
              value={tarifId}
              onChange={(event) =>
                setTarifId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Sélectionner un tarif
              </option>

              {tarifs
                .filter(
                  (tarif) =>
                    tarif.active !==
                      false &&
                    tarif.is_active !==
                      false,
                )
                .map(
                  (tarif) => (
                    <option
                      key={tarif.id}
                      value={String(
                        tarif.id,
                      )}
                    >
                      {getTarifName(
                        tarif,
                      )}{" "}
                      —{" "}
                      {getTarifAmount(
                        tarif,
                      ).toLocaleString(
                        "fr-FR",
                      )}{" "}
                      $
                    </option>
                  ),
                )}
            </select>

            {selectedTarif && (
              <p className="mt-2 text-xs text-slate-400">
                Montant de la réservation :{" "}
                <span className="font-semibold text-emerald-400">
                  {getTarifAmount(
                    selectedTarif,
                  ).toLocaleString(
                    "fr-FR",
                  )}{" "}
                  $
                </span>
              </p>
            )}
          </div>

          {/* DATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date de l'événement *
            </label>

            <input
              type="date"
              value={
                eventDate
              }
              onChange={(event) =>
                setEventDate(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* NOMBRE DE PERSONNES */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nombre de personnes *
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={
                guestCount
              }
              onChange={(event) =>
                setGuestCount(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Ex. 100"
            />
          </div>

          {/* HEURE DÉBUT */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Heure de début *
            </label>

            <input
              type="time"
              value={
                startTime
              }
              onChange={(event) =>
                setStartTime(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* HEURE FIN */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Heure de fin *
            </label>

            <input
              type="time"
              value={
                endTime
              }
              onChange={(event) =>
                setEndTime(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          RAPPEL MÉTIER
      ====================================================== */}

      <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-4 text-sm text-blue-200">
        <p className="font-semibold">
          Calcul automatique
        </p>

        <p className="mt-1 text-blue-300/80">
          Le type d'événement et le montant total
          sont déterminés automatiquement par Django
          à partir du tarif sélectionné. Aucun paiement
          n'est créé lors de cette étape.
        </p>
      </div>

      {/* ======================================================
          BOUTONS
      ====================================================== */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/reservations",
            )
          }
          disabled={saving}
          className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}

          {saving
            ? "Enregistrement..."
            : isEdit
              ? "Enregistrer les modifications"
              : "Créer la réservation"}
        </button>
      </div>
    </form>
  );
}