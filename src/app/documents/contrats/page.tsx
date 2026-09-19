"use client";

import PageHeader from "@/components/shared/PageHeader";

const contracts = [
  ["CTR-2026-001", "Jean Dupont", "Mariage", "12/09/2026", "Signé"],
  ["CTR-2026-002", "Marie Kabeya", "Anniversaire", "20/09/2026", "En attente"],
];

export default function ContratsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Contrats"
        description="Consultez et gérez les contrats de réservation."
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        {contracts.map(([number, client, event, date, status]) => (
          <div
            key={number}
            className="grid gap-2 border-b p-4 md:grid-cols-5"
          >
            <span className="font-medium">{number}</span>
            <span>{client}</span>
            <span>{event}</span>
            <span>{date}</span>
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
