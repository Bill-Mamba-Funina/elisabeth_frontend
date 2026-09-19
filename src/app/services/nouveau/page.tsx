"use client";

import { FormEvent } from "react";

export default function NouveauServicePage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Service enregistré. Connectez ce formulaire à votre API.");
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau service</h1>
        <p className="text-gray-500">Ajouter un service proposé aux clients.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
        <input required placeholder="Nom du service" className="w-full rounded-lg border px-4 py-3" />
        <textarea placeholder="Description du service" className="min-h-32 w-full rounded-lg border px-4 py-3" />
        <div className="grid gap-5 md:grid-cols-2">
          <input type="number" min="0" placeholder="Prix ($)" className="rounded-lg border px-4 py-3" />
          <select className="rounded-lg border px-4 py-3">
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </div>
        <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          Créer le service
        </button>
      </form>
    </section>
  );
}
