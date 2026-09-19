"use client";

import PageHeader from "@/components/shared/PageHeader";

const sections = [
  ["Utilisateurs", "Gérer les comptes et les accès."],
  ["Rôles et permissions", "Définir les niveaux d'accès."],
  ["Paramètres de la salle", "Configurer les informations de l'établissement."],
  ["Modes de paiement", "Configurer les modes de paiement acceptés."],
  ["Devises", "Gérer USD et FC."],
  ["Journal des opérations", "Consulter les actions effectuées par les utilisateurs."],
];

export default function AdministrationPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Administration"
        description="Configuration générale et gestion des accès."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, description]) => (
          <div key={title} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-500">{description}</p>

            <button className="mt-4 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Configurer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
