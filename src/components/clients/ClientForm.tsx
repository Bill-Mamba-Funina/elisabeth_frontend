"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface ClientFormProps {
  onCreated?: (client: any) => void;
  redirectAfterCreate?: boolean;
}

export default function ClientForm({
  onCreated,
  redirectAfterCreate = true,
}: ClientFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        API_ROUTES.CLIENTS,
        {
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || null,
          address: form.address || null,
          notes: form.notes || null,
        }
      );

      const client = response.data;

      if (onCreated) {
        onCreated(client);
      }

      if (redirectAfterCreate) {
        router.push(`/clients/${client.id}`);
      }
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Impossible de créer le client."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm"
    >
      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Nom complet *
        </label>

        <input
          required
          value={form.full_name}
          onChange={(e) =>
            updateField("full_name", e.target.value)
          }
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          placeholder="Nom complet du client"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Téléphone *
          </label>

          <input
            required
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            placeholder="+243..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            placeholder="client@email.com"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Adresse
        </label>

        <textarea
          value={form.address}
          onChange={(e) =>
            updateField("address", e.target.value)
          }
          className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Notes
        </label>

        <textarea
          value={form.notes}
          onChange={(e) =>
            updateField("notes", e.target.value)
          }
          className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Enregistrement..."
          : "Créer le client"}
      </button>
    </form>
  );
}