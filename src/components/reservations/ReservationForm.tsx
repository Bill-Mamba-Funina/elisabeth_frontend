"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Client {
  id: number;
  full_name: string;
}

interface Hall {
  id: number;
  name: string;
  price: number | string;
  capacity: number;
}

interface ReservationFormProps {
  onSubmitSuccess?: (reservation: any) => void;
}

export default function ReservationForm({
  onSubmitSuccess,
}: ReservationFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);

  const [clientMode, setClientMode] = useState<
    "existing" | "new"
  >("existing");

  const [form, setForm] = useState({
    client: "",
    full_name: "",
    phone: "",
    email: "",
    address: "",

    hall: "",
    event_type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    guest_count: 1,
    description: "",
    observations: "",
    total_amount: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);

        const [clientsResponse, hallsResponse] =
          await Promise.all([
            api.get(`${API_ROUTES.CLIENTS}?page_size=1000`),
            api.get(`${API_ROUTES.HALLS}?page_size=1000`),
          ]);

        const clientsData = clientsResponse.data;
        const hallsData = hallsResponse.data;

        setClients(
          Array.isArray(clientsData)
            ? clientsData
            : clientsData?.results || []
        );

        setHalls(
          Array.isArray(hallsData)
            ? hallsData
            : hallsData?.results || []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.detail ||
            "Impossible de charger les clients et les salles."
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string | number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleHallChange(value: string) {
    const hall = halls.find(
      (item) => String(item.id) === value
    );

    setForm((previous) => ({
      ...previous,
      hall: value,
      total_amount: hall
        ? String(hall.price)
        : previous.total_amount,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      let clientId = Number(form.client);

      // ------------------------------------------------------
      // Création automatique du client si nécessaire
      // ------------------------------------------------------

      if (clientMode === "new") {
        if (!form.full_name || !form.phone) {
          throw new Error(
            "Le nom et le téléphone du nouveau client sont obligatoires."
          );
        }

        const clientResponse = await api.post(
          API_ROUTES.CLIENTS,
          {
            full_name: form.full_name,
            phone: form.phone,
            email: form.email || null,
            address: form.address || null,
          }
        );

        clientId = clientResponse.data.id;
      }

      if (!clientId) {
        throw new Error(
          "Veuillez sélectionner ou créer un client."
        );
      }

      if (!form.hall) {
        throw new Error(
          "Veuillez sélectionner une salle."
        );
      }

      const reservationResponse = await api.post(
        API_ROUTES.RESERVATIONS,
        {
          client: clientId,
          hall: Number(form.hall),

          event_type: form.event_type,
          event_date: form.event_date,
          start_time: form.start_time,
          end_time: form.end_time,

          guest_count: Number(form.guest_count),

          description: form.description || null,
          observations: form.observations || null,

          total_amount: Number(form.total_amount || 0),
        }
      );

      if (onSubmitSuccess) {
        onSubmitSuccess(reservationResponse.data);
      }
    } catch (error: any) {
      console.error(error);

      const backendError = error?.response?.data;

      if (backendError) {
        setError(
          typeof backendError === "string"
            ? backendError
            : JSON.stringify(
                backendError,
                null,
                2
              )
        );
      } else {
        setError(
          error?.message ||
            "Impossible de créer la réservation."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="rounded-xl border bg-white p-8 text-gray-700">
        Chargement des clients et des salles...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-xl border bg-white p-6 text-gray-900 shadow-sm"
    >
      {error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </pre>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          1. Client
        </h2>

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setClientMode("existing")}
            className={`rounded-lg px-4 py-2 text-sm ${
              clientMode === "existing"
                ? "bg-blue-600 text-white"
                : "border bg-white"
            }`}
          >
            Client existant
          </button>

          <button
            type="button"
            onClick={() => setClientMode("new")}
            className={`rounded-lg px-4 py-2 text-sm ${
              clientMode === "new"
                ? "bg-blue-600 text-white"
                : "border bg-white"
            }`}
          >
            Nouveau client
          </button>
        </div>

        {clientMode === "existing" ? (
          <select
            required
            value={form.client}
            onChange={(e) =>
              updateField("client", e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="">
              Sélectionner un client
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.full_name}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-4">
            <input
              required
              value={form.full_name}
              onChange={(e) =>
                updateField(
                  "full_name",
                  e.target.value
                )
              }
              placeholder="Nom complet"
              className="w-full rounded-lg border px-4 py-3"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
                placeholder="Téléphone"
                className="rounded-lg border px-4 py-3"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                placeholder="Email"
                className="rounded-lg border px-4 py-3"
              />
            </div>

            <textarea
              value={form.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
              placeholder="Adresse"
              className="min-h-24 w-full rounded-lg border px-4 py-3"
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          2. Événement
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            value={form.event_type}
            onChange={(e) =>
              updateField(
                "event_type",
                e.target.value
              )
            }
            placeholder="Type d'événement"
            className="rounded-lg border px-4 py-3"
          />

          <select
            required
            value={form.hall}
            onChange={(e) =>
              handleHallChange(e.target.value)
            }
            className="rounded-lg border px-4 py-3"
          >
            <option value="">
              Sélectionner une salle
            </option>

            {halls
              .filter((hall) => hall)
              .map((hall) => (
                <option
                  key={hall.id}
                  value={hall.id}
                >
                  {hall.name} — {hall.capacity} places
                </option>
              ))}
          </select>

          <input
            required
            type="date"
            value={form.event_date}
            onChange={(e) =>
              updateField(
                "event_date",
                e.target.value
              )
            }
            className="rounded-lg border px-4 py-3"
          />

          <input
            required
            type="number"
            min="1"
            value={form.guest_count}
            onChange={(e) =>
              updateField(
                "guest_count",
                Number(e.target.value)
              )
            }
            placeholder="Nombre d'invités"
            className="rounded-lg border px-4 py-3"
          />

          <input
            required
            type="time"
            value={form.start_time}
            onChange={(e) =>
              updateField(
                "start_time",
                e.target.value
              )
            }
            className="rounded-lg border px-4 py-3"
          />

          <input
            required
            type="time"
            value={form.end_time}
            onChange={(e) =>
              updateField(
                "end_time",
                e.target.value
              )
            }
            className="rounded-lg border px-4 py-3"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          3. Finances
        </h2>

        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={form.total_amount}
          onChange={(e) =>
            updateField(
              "total_amount",
              e.target.value
            )
          }
          placeholder="Montant total"
          className="w-full rounded-lg border px-4 py-3"
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          4. Informations complémentaires
        </h2>

        <textarea
          value={form.description}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          placeholder="Description"
          className="mb-4 min-h-24 w-full rounded-lg border px-4 py-3"
        />

        <textarea
          value={form.observations}
          onChange={(e) =>
            updateField(
              "observations",
              e.target.value
            )
          }
          placeholder="Observations"
          className="min-h-24 w-full rounded-lg border px-4 py-3"
        />
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Création en cours..."
          : "Créer la réservation"}
      </button>
    </form>
  );
}
