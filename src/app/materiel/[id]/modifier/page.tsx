"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

interface Materiel {
  id: number | string;
  name: string;
  description?: string | null;
  quantity_available: number;
  unit_price: number | string;
  etat: string;
}

export default function ModifierMaterielPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] =
    useState("");
  const [etat, setEtat] =
    useState("ACTIF");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMaterial() {
      try {
        const response = await api.get(
          `${API_ROUTES.MATERIALS}${id}/`
        );

        const material =
          response.data as Materiel;

        setName(material.name ?? "");
        setDescription(
          material.description ?? ""
        );
        setQuantity(
          String(
            material.quantity_available ?? 0
          )
        );
        setUnitPrice(
          String(material.unit_price ?? 0)
        );
        setEtat(material.etat ?? "ACTIF");
      } catch (error) {
        console.error(error);

        setError(
          "Impossible de charger ce matériel."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadMaterial();
    }
  }, [id]);

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

    try {
      setSaving(true);

      await api.patch(
        `${API_ROUTES.MATERIALS}${id}/`,
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
          };
        };
      };

      setError(
        axiosError.response?.data?.detail ||
          "Impossible de modifier ce matériel."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-gray-500">
          <Loader2 className="mx-auto h-7 w-7 animate-spin" />

          <p className="mt-3">
            Chargement du matériel...
          </p>
        </div>
      </div>
    );
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
            Modifier le matériel
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Modifiez les informations et l'état du matériel.
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
              Nom *
            </label>

            <input
              required
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantité
            </label>

            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              État
            </label>

            <select
              value={etat}
              onChange={(event) =>
                setEtat(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
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
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            href="/materiel"
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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