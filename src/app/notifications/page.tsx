"use client";

import PageHeader from "@/components/shared/PageHeader";

const notifications = [
  ["Paiement en retard", "Le paiement de Jean Dupont est en attente.", "Important"],
  ["Réservation à confirmer", "Une nouvelle demande de réservation attend votre validation.", "Attention"],
  ["Événement demain", "Un événement est prévu demain dans la Grande Salle.", "Rappel"],
  ["Contrat à signer", "Un contrat est toujours en attente de signature.", "Document"],
  ["Paiement reçu", "Un paiement de 500 $ a été enregistré.", "Information"],
];

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Notifications"
        description="Consultez les alertes et informations importantes."
      />

      <div className="space-y-3">
        {notifications.map(([title, message, type]) => (
          <div key={title} className="rounded-xl border bg-white p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
