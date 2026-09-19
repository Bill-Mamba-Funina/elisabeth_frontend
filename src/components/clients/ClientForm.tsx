"use client";

import { FormEvent } from "react";

type ClientFormProps = {
  onSubmit?: (data: Record<string, string>) => void;
};

export default function ClientForm({ onSubmit }: ClientFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;

    onSubmit?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <input name="nom" required placeholder="Nom" className="rounded-lg border px-4 py-3" />
        <input name="prenom" required placeholder="Prénom" className="rounded-lg border px-4 py-3" />
        <input name="telephone" placeholder="Téléphone" className="rounded-lg border px-4 py-3" />
        <input name="email" type="email" placeholder="Email" className="rounded-lg border px-4 py-3" />
      </div>

      <textarea
        name="adresse"
        placeholder="Adresse"
        className="min-h-28 w-full rounded-lg border px-4 py-3"
      />

      <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
        Enregistrer le client
      </button>
    </form>
  );
}
