"use client";

import PageHeader from "@/components/shared/PageHeader";

const services = [
  ["Catering", 300],
  ["Chaises", 50],
  ["Tables", 50],
  ["Sonorisation", 150],
  ["Éclairage", 100],
  ["Gâteau", 120],
  ["Décoration", 200],
  ["Photographie", 250],
  ["Vidéo", 300],
  ["Parking", 50],
  ["Personnel", 100],
  ["Nettoyage", 80],
  ["DJ", 200],
];

export default function ServicesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Services supplémentaires"
        description="Gérez les services proposés aux clients."
        action="Ajouter un service"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map(([name, price]) => (
          <div key={name} className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{name}</h2>
            <p className="mt-2 text-xl font-bold">{price} $</p>
            <p className="mt-1 text-sm text-gray-500">Prix du service</p>
          </div>
        ))}
      </div>
    </div>
  );
}
