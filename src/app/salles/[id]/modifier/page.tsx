"use client";

import { useParams } from "next/navigation";

export default function ModifierSallePage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Modifier la salle</h1>

      <p className="mt-2 text-gray-600">
        ID de la salle : {params.id}
      </p>

      <form className="mt-6 max-w-2xl space-y-5 rounded-lg border bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block font-medium">
            Nom de la salle
          </label>

          <input
            type="text"
            placeholder="Nom de la salle"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Capacité
          </label>

          <input
            type="number"
            placeholder="Nombre de personnes"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            rows={5}
            placeholder="Description de la salle"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Enregistrer les modifications
        </button>
      </form>
    </main>
  );
}
