"use client";

import { FormEvent } from "react";

export default function NouveauPersonnelPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Personnel enregistré. Connectez le formulaire à votre API pour sauvegarder réellement.");
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau membre du personnel</h1>
        <p className="text-gray-500">Ajouter un membre à l'équipe.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <input name="nom" required placeholder="Nom" className="rounded-lg border px-4 py-3" />
          <input name="prenom" required placeholder="Prénom" className="rounded-lg border px-4 py-3" />
          <input name="telephone" placeholder="Téléphone" className="rounded-lg border px-4 py-3" />
          <input name="email" type="email" placeholder="Email" className="rounded-lg border px-4 py-3" />
          <select name="fonction" className="rounded-lg border px-4 py-3">
            <option>Gérante</option>
            <option>Agent de sécurité</option>
            <option>Décorateur</option>
            <option>Technicien</option>
            <option>Nettoyeur</option>
          </select>
          <select name="statut" className="rounded-lg border px-4 py-3">
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </div>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white">
          Enregistrer
        </button>
      </form>
    </section>
  );
}
