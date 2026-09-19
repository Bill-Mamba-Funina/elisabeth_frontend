"use client";

import { FormEvent } from "react";

export default function ReservationForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Réservation enregistrée. Connectez le formulaire à votre API.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <input required name="client" placeholder="Client" className="rounded-lg border px-4 py-3" />
        <input required name="salle" placeholder="Salle" className="rounded-lg border px-4 py-3" />
        <input required name="date" type="date" className="rounded-lg border px-4 py-3" />
        <input required name="heure" type="time" className="rounded-lg border px-4 py-3" />
        <input name="nombre_invites" type="number" min="1" placeholder="Nombre d'invités" className="rounded-lg border px-4 py-3" />
        <select name="statut" className="rounded-lg border px-4 py-3">
          <option>En attente</option>
          <option>Confirmée</option>
          <option>Annulée</option>
        </select>
      </div>

      <textarea
        name="observation"
        placeholder="Observations"
        className="min-h-28 w-full rounded-lg border px-4 py-3"
      />

      <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
        Enregistrer la réservation
      </button>
    </form>
  );
}
