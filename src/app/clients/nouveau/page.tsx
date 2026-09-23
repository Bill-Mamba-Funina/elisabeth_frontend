"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";

export default function NouveauClientPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/clients"
          className="rounded-lg border bg-white p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Nouveau client
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enregistrer un client dans la base.
          </p>
        </div>
      </div>

      <ClientForm />
    </section>
  );
}
