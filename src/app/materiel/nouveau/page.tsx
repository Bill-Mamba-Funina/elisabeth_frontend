"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function NouveauMaterielPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [quantity, setQuantity] = useState("0");
  const [unitPrice, setUnitPrice] =
    useState("0");
  const [etat, setEtat] =
    useState("ACTIF");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Le nom du matériel est obligatoire."
      );
      return;
    }

    if (Number(quantity) < 0) {
      setError(
        "La quantité ne peut pas être négative."
      );
      return;
    }

    try {
      setSaving(true);

      await api.post(
        API_ROUTES.MATERIALS,
        {
          name: name.trim(),
          description:
            description.trim() || null,
          quantity_available: Number(quantity),
          unit_price: Number(unitPrice),
          etat,
          is_active: etat === "ACTIF",
        }
      );

      router.push("/materiel");
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
          "Impossible d'enregistrer le matériel."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/materiel"
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ajouter un matériel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enregistrer un nouveau matériel.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nom du matériel *
            </label>

            <input
              required
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex. Chaises"
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantité disponible *
            </label>

            <input
              required
              type="number"
              min="0"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Prix unitaire
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(event) =>
                setUnitPrice(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              État *
            </label>

            <select
              value={etat}
              onChange={(event) =>
                setEtat(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="ACTIF">
                Actif
              </option>

              <option value="EN_REPARATION">
                En réparation
              </option>

              <option value="ABIME">
                Abîmé
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Description du matériel..."
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            href="/materiel"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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