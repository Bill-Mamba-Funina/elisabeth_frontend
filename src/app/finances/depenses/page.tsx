"use client";

import PageHeader from "@/components/shared/PageHeader";

const expenses = [
  ["Électricité", 150],
  ["Nettoyage", 80],
  ["Sécurité", 50],
  ["Maintenance", 70],
  ["Décoration", 40],
];

export default function DepensesPage() {
  const total = expenses.reduce((sum, [, amount]) => sum + Number(amount), 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Dépenses"
        description="Enregistrez et suivez les dépenses de l'établissement."
        action="Nouvelle dépense"
      />

      <div className="mb-6 rounded-xl border bg-white p-5">
        <p className="text-sm text-gray-500">Total des dépenses</p>
        <p className="mt-2 text-3xl font-bold">{total} $</p>
      </div>

      <div className="rounded-xl border bg-white">
        {expenses.map(([name, amount]) => (
          <div
            key={name}
            className="flex justify-between border-b p-4 last:border-0"
          >
            <span>{name}</span>
            <span className="font-medium">{amount} $</span>
          </div>
        ))}
      </div>
    </div>
  );
}
