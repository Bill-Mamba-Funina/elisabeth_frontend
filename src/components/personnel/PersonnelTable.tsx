"use client";

import { Mail, Pencil, Phone, Trash2, UserRound } from "lucide-react";

export interface Personnel {
  id: number | string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  fonction: string;
  statut: "ACTIF" | "INACTIF" | string;
}

const FONCTION_LABELS: Record<string, string> = {
  GERANTE: "Gérante",
  AGENT_SECURITE: "Agent de sécurité",
  DECORATEUR: "Décorateur",
  TECHNICIEN: "Technicien",
  NETTOYEUR: "Nettoyeur",
  SERVEUR: "Serveur",
  RECEPTIONNISTE: "Réceptionniste",
  AUTRE: "Autre",
};

export default function PersonnelTable({
  personnel,
  onEdit,
  onDelete,
}: {
  personnel: Personnel[];
  onEdit: (personne: Personnel) => void;
  onDelete: (personne: Personnel) => void;
}) {
  if (personnel.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <UserRound className="mx-auto h-10 w-10 text-gray-300" />

        <h2 className="mt-3 font-semibold text-gray-900">
          Aucun personnel
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Aucun membre du personnel n'a encore été enregistré.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="hidden grid-cols-7 border-b bg-gray-50 p-4 text-sm font-semibold text-gray-700 lg:grid">
        <span>Nom</span>
        <span>Fonction</span>
        <span>Téléphone</span>
        <span>Email</span>
        <span>Statut</span>
        <span>ID</span>
        <span className="text-right">Actions</span>
      </div>

      {personnel.map((personne) => (
        <div
          key={personne.id}
          className="border-b p-4 last:border-b-0"
        >
          <div className="grid gap-3 lg:grid-cols-7 lg:items-center">
            <div>
              <p className="font-medium text-gray-900">
                {personne.prenom} {personne.nom}
              </p>
            </div>

            <div className="text-sm text-gray-700">
              {FONCTION_LABELS[personne.fonction] ??
                personne.fonction}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />

              {personne.telephone || "-"}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />

              <span className="truncate">
                {personne.email || "-"}
              </span>
            </div>

            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  personne.statut === "ACTIF"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {personne.statut === "ACTIF"
                  ? "Actif"
                  : "Inactif"}
              </span>
            </div>

            <div className="text-sm text-gray-400">
              #{personne.id}
            </div>

            <div className="flex justify-start gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => onEdit(personne)}
                className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(personne)}
                className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}