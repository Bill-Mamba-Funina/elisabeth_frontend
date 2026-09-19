"use client";

import PageHeader from "@/components/shared/PageHeader";

const receipts = [
  ["REC-2026-00452", "Jean Dupont", "300 $", "07/09/2026"],
  ["REC-2026-00453", "Marie Kabeya", "500 $", "08/09/2026"],
];

export default function RecusPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reçus de paiement"
        description="Consultez et imprimez les reçus."
      />

      <div className="rounded-xl border bg-white">
        {receipts.map(([number, client, amount, date]) => (
          <div
            key={number}
            className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium">{number}</p>
              <p className="text-sm text-gray-500">
                {client} — {date}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold">{amount}</span>
              <button className="rounded-lg border px-3 py-2 text-sm">
                Imprimer
              </button>
              <button className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white">
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
