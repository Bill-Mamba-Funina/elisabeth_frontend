"use client";

import PageHeader from "@/components/shared/PageHeader";

type Equipment = {
  name: string;
  total: number;
  available: number;
};

const equipment: Equipment[] = [
  { name: "Chaises", total: 500, available: 350 },
  { name: "Tables", total: 80, available: 40 },
  { name: "Climatiseurs", total: 10, available: 8 },
  { name: "Systèmes audio", total: 4, available: 3 },
  { name: "Projecteurs", total: 20, available: 12 },
  { name: "Microphones", total: 15, available: 11 },
  { name: "Chapiteaux", total: 10, available: 7 },
];

export default function MaterielPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Matériel"
        description="Suivez le stock et la disponibilité du matériel."
        action="Ajouter du matériel"
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-4 border-b bg-gray-50 p-4 text-sm font-semibold">
          <span>Matériel</span>
          <span>Total</span>
          <span>Disponible</span>
          <span>État</span>
        </div>

        {equipment.map((item) => (
          <div
            key={item.name}
            className="grid grid-cols-4 border-b p-4 text-sm"
          >
            <span>{item.name}</span>
            <span>{item.total}</span>
            <span>{item.available}</span>
            <span>
              {item.available > 0 ? "Disponible" : "Indisponible"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}