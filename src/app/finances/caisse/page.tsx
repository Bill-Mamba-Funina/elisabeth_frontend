"use client";

import PageHeader from "@/components/shared/PageHeader";

export default function CaissePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Caisse"
        description="Suivi des entrées, sorties et du solde de caisse."
        action="Nouveau mouvement"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total entrées</p>
          <p className="mt-2 text-2xl font-bold">4 850 $</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total sorties</p>
          <p className="mt-2 text-2xl font-bold">850 $</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Solde caisse</p>
          <p className="mt-2 text-2xl font-bold">4 000 $</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Derniers mouvements</h2>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span>Paiement client</span>
            <span>+300 $</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span>Électricité</span>
            <span>-150 $</span>
          </div>

          <div className="flex justify-between">
            <span>Nettoyage</span>
            <span>-80 $</span>
          </div>
        </div>
      </div>
    </div>
  );
}
