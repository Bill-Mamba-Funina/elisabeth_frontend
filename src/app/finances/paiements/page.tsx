"use client";

import PageHeader from "@/components/shared/PageHeader";

const payments = [
  {
    receipt: "REC-2026-00452",
    client: "Jean Dupont",
    amount: 300,
    currency: "USD",
    method: "Espèces",
    date: "07/09/2026",
  },
  {
    receipt: "REC-2026-00453",
    client: "Marie Kabeya",
    amount: 500,
    currency: "USD",
    method: "Mobile Money",
    date: "08/09/2026",
  },
];

export default function PaiementsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Paiements"
        description="Consultez les paiements enregistrés."
        action="Enregistrer un paiement"
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-6 border-b bg-gray-50 p-4 text-sm font-semibold">
          <span>Reçu</span>
          <span>Client</span>
          <span>Montant</span>
          <span>Devise</span>
          <span>Mode</span>
          <span>Date</span>
        </div>

        {payments.map((payment) => (
          <div
            key={payment.receipt}
            className="grid grid-cols-6 border-b p-4 text-sm"
          >
            <span>{payment.receipt}</span>
            <span>{payment.client}</span>
            <span>{payment.amount}</span>
            <span>{payment.currency}</span>
            <span>{payment.method}</span>
            <span>{payment.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
