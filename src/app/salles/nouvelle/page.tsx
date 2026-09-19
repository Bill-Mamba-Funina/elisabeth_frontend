"use client";

import { FormEvent } from "react";

export default function NouvelleSallePage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Salle enregistrée. Connectez ce formulaire à votre API.");
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle salle</h1>
        <p className="text-gray-500">Créer une nouvelle salle de fêtes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
        <input required placeholder="Nom de la salle" className="w-full rounded-lg border px-4 py-3" />
        <textarea placeholder="Description" className="min-h-32 w-full rounded-lg border px-4 py-3" />
        <div className="grid gap-5 md:grid-cols-2">
          <input type="number" min="1" placeholder="Capacité" className="rounded-lg border px-4 py-3" />
          <input type="number" min="0" placeholder="Prix de location ($)" className="rounded-lg border px-4 py-3" />
        </div>
        <input placeholder="Adresse" className="w-full rounded-lg border px-4 py-3" />
        <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          Créer la salle
        </button>
      </form>
    </section>
  );
}
