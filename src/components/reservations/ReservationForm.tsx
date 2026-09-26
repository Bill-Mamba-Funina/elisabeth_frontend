"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
  price: string | number;
  is_active: boolean;
}

interface Tarif {
  id: number;
  name: string;
  description?: string | null;
  amount: string | number;
  is_active: boolean;
}

interface ReservationFormProps {
  onSubmitSuccess?: () => void;
}

interface FormData {
  client_full_name: string;
  client_phone: string;
  client_email: string;
  client_address: string;
  hall: string;
  tarif: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: string;
}

const initialForm: FormData = {
  client_full_name: "",
  client_phone: "",
  client_email: "",
  client_address: "",
  hall: "",
  tarif: "",
  event_date: "",
  start_time: "",
  end_time: "",
  guest_count: "",
};

function formatAmount(value: string | number): string {
  return Number(value || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ReservationForm({
  onSubmitSuccess,
}: ReservationFormProps) {
  const [form, setForm] = useState<FormData>(initialForm);

  const [clients, setClients] = useState<Client[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          clientsResponse,
          hallsResponse,
          tarifsResponse,
        ] = await Promise.all([
          api.get(`${API_ROUTES.CLIENTS}?page_size=1000`),
          api.get(`${API_ROUTES.HALLS}?page_size=1000`),
          api.get(`${API_ROUTES.TARIFS}?page_size=1000`),
        ]);

        const clientsData = clientsResponse.data;
        const hallsData = hallsResponse.data;
        const tarifsData = tarifsResponse.data;

        setClients(
          Array.isArray(clientsData)
            ? clientsData
            : clientsData?.results ?? []
        );

        setHalls(
          Array.isArray(hallsData)
            ? hallsData
            : hallsData?.results ?? []
        );

        setTarifs(
          Array.isArray(tarifsData)
            ? tarifsData
            : tarifsData?.results ?? []
        );
      } catch (err) {
        console.error(err);

        setError(
          "Impossible de charger les clients, salles et tarifs."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // CHANGEMENT
  // ==========================================================

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // CLIENT PAR TELEPHONE
  // ==========================================================

  const handlePhoneChange = (value: string) => {
    handleChange("client_phone", value);

    const normalizedPhone = value
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "");

    const existingClient = clients.find(
      (client) =>
        client.phone
          .trim()
          .replace(/\s+/g, "")
          .replace(/-/g, "")
          .replace(/\(/g, "")
          .replace(/\)/g, "") === normalizedPhone
    );

    if (existingClient) {
      setForm((previous) => ({
        ...previous,
        client_full_name: existingClient.full_name,
        client_email: existingClient.email ?? "",
        client_address: existingClient.address ?? "",
      }));
    }
  };

  // ==========================================================
  // TARIF
  // ==========================================================

  const selectedTarif = tarifs.find(
    (tarif) => String(tarif.id) === form.tarif
  );

  const handleTarifChange = (value: string) => {
    handleChange("tarif", value);
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.client_full_name.trim()) {
      setError(
        "Le nom complet du client est obligatoire."
      );
      return;
    }

    if (!form.client_phone.trim()) {
      setError(
        "Le numéro de téléphone du client est obligatoire."
      );
      return;
    }

    if (!form.hall) {
      setError(
        "Veuillez sélectionner une salle."
      );
      return;
    }

    if (!form.tarif) {
      setError(
        "Veuillez sélectionner un tarif."
      );
      return;
    }

    if (!form.event_date) {
      setError(
        "La date de l'événement est obligatoire."
      );
      return;
    }

    if (!form.start_time || !form.end_time) {
      setError(
        "Les heures de début et de fin sont obligatoires."
      );
      return;
    }

    if (form.start_time >= form.end_time) {
      setError(
        "L'heure de fin doit être supérieure à l'heure de début."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        client_full_name:
          form.client_full_name.trim(),

        client_phone:
          form.client_phone.trim(),

        client_email:
          form.client_email.trim() || null,

        client_address:
          form.client_address.trim() || null,

        hall: Number(form.hall),

        tarif: Number(form.tarif),

        event_date: form.event_date,

        start_time: form.start_time,

        end_time: form.end_time,

        guest_count: Number(
          form.guest_count || 0
        ),
      };

      await api.post(
        API_ROUTES.RESERVATIONS,
        payload
      );

      setSuccess(
        "La réservation a été créée avec succès."
      );

      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
        }, 500);
      }
    } catch (err: unknown) {
      console.error(err);

      const error = err as {
        response?: {
          data?: Record<string, unknown>;
        };
      };

      const responseData =
        error.response?.data;

      if (responseData?.client_phone) {
        const value =
          responseData.client_phone;

        setError(
          Array.isArray(value)
            ? String(value[0])
            : String(value)
        );
      } else if (responseData?.tarif) {
        const value =
          responseData.tarif;

        setError(
          Array.isArray(value)
            ? String(value[0])
            : String(value)
        );
      } else if (responseData?.detail) {
        setError(
          String(responseData.detail)
        );
      } else {
        setError(
          "Impossible de créer la réservation."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingData) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-12">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  // ==========================================================
  // FORMULAIRE
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
    >
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {/* ======================================================
          CLIENT
      ====================================================== */}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Client
          </h2>

          <p className="text-sm text-slate-400">
            Le numéro de téléphone permet de
            retrouver automatiquement un client
            existant.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Téléphone *
            </label>

            <input
              type="text"
              value={form.client_phone}
              onChange={(event) =>
                handlePhoneChange(
                  event.target.value
                )
              }
              placeholder="+243..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Nom complet *
            </label>

            <input
              type="text"
              value={form.client_full_name}
              onChange={(event) =>
                handleChange(
                  "client_full_name",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={form.client_email}
              onChange={(event) =>
                handleChange(
                  "client_email",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Adresse
            </label>

            <input
              type="text"
              value={form.client_address}
              onChange={(event) =>
                handleChange(
                  "client_address",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          RESERVATION
      ====================================================== */}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Réservation
          </h2>

          <p className="text-sm text-slate-400">
            Sélectionnez le tarif correspondant à
            l'événement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* SALLE */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Salle *
            </label>

            <select
              value={form.hall}
              onChange={(event) =>
                handleChange(
                  "hall",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            >
              <option value="">
                Sélectionner une salle
              </option>

              {halls
                .filter(
                  (hall) => hall.is_active
                )
                .map((hall) => (
                  <option
                    key={hall.id}
                    value={hall.id}
                  >
                    {hall.name}
                  </option>
                ))}
            </select>
          </div>

          {/* TARIF */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Tarif / Événement *
            </label>

            <select
              value={form.tarif}
              onChange={(event) =>
                handleTarifChange(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            >
              <option value="">
                Sélectionner un tarif
              </option>

              {tarifs
                .filter(
                  (tarif) => tarif.is_active
                )
                .map((tarif) => (
                  <option
                    key={tarif.id}
                    value={tarif.id}
                  >
                    {tarif.name} —{" "}
                    {formatAmount(
                      tarif.amount
                    )}{" "}
                    $
                  </option>
                ))}
            </select>
          </div>

          {/* EVENEMENT */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Événement
            </label>

            <input
              type="text"
              value={
                selectedTarif?.name ?? ""
              }
              readOnly
              placeholder="Le nom du tarif apparaîtra ici"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 outline-none"
            />
          </div>

          {/* PRIX */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Prix du tarif
            </label>

            <div className="flex h-[50px] items-center rounded-lg border border-blue-800 bg-blue-950/30 px-4">
              <span className="text-lg font-bold text-blue-300">
                {selectedTarif
                  ? `${formatAmount(
                      selectedTarif.amount
                    )} $`
                  : "—"}
              </span>
            </div>
          </div>

          {/* DATE */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Date *
            </label>

            <input
              type="date"
              value={form.event_date}
              onChange={(event) =>
                handleChange(
                  "event_date",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* PERSONNES */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Nombre de personnes
            </label>

            <input
              type="number"
              min="0"
              value={form.guest_count}
              onChange={(event) =>
                handleChange(
                  "guest_count",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* HEURE DEBUT */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Heure de début *
            </label>

            <input
              type="time"
              value={form.start_time}
              onChange={(event) =>
                handleChange(
                  "start_time",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* HEURE FIN */}

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Heure de fin *
            </label>

            <input
              type="time"
              value={form.end_time}
              onChange={(event) =>
                handleChange(
                  "end_time",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          TOTAL
      ====================================================== */}

      {selectedTarif && (
        <section className="rounded-xl border border-blue-900 bg-blue-950/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Total de la réservation
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tarif : {selectedTarif.name}
              </p>
            </div>

            <p className="text-2xl font-bold text-blue-300">
              {formatAmount(
                selectedTarif.amount
              )}{" "}
              $
            </p>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Ce montant provient automatiquement
            du tarif sélectionné. Il ne peut pas
            être modifié dans la réservation.
          </p>
        </section>
      )}

      {/* ======================================================
          ACTION
      ====================================================== */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Créer la réservation
            </>
          )}
        </button>
      </div>
    </form>
  );
}