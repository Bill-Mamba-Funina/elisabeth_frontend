"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";

export default function NouvelleSallePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: "",
    price: "",
    is_active: true,
  });

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("name", form.name);
      data.append("description", form.description);
      data.append("capacity", form.capacity);
      data.append("price", form.price);
      data.append(
        "is_active",
        String(form.is_active)
      );

      if (image) {
        data.append("image", image);
      }

      await api.post(
        API_ROUTES.HALLS,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      router.push("/salles");
      router.refresh();
    } catch (error: any) {
      console.error(error);

      setError(
        typeof error?.response?.data === "object"
          ? JSON.stringify(
              error.response.data,
              null,
              2
            )
          : "Impossible de créer la salle."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/salles"
          className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            Nouvelle salle
          </h1>

          <p className="text-white/60">
            Ajouter une nouvelle salle de fêtes.
          </p>
        </div>
      </div>

      {error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </pre>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <input
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Nom de la salle"
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
        />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          placeholder="Description"
          className="min-h-32 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <input
            required
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) =>
              setForm({
                ...form,
                capacity: e.target.value,
              })
            }
            placeholder="Capacité"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />

          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            placeholder="Prix"
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Image de la salle
          </label>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-8 hover:bg-white/10">
            <Upload className="h-5 w-5" />

            <span>
              Sélectionner une image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
        </div>

        {preview && (
          <img
            src={preview}
            alt="Aperçu"
            className="max-h-72 w-full rounded-xl object-cover"
          />
        )}

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm({
                ...form,
                is_active: e.target.checked,
              })
            }
          />

          <span>
            Salle active
          </span>
        </label>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Création..."
            : "Créer la salle"}
        </button>
      </form>
    </section>
  );
}
