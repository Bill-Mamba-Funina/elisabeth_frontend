"use client";

import { Package, Pencil, Trash2 } from "lucide-react";

export interface Materiel {
  id: number | string;
  name: string;
  description?: string | null;
  quantity_available: number;
  unit_price: number | string;
  is_active: boolean;
  created_at?: string;
}

function formatPrice(value: number | string) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export default function MaterielTable({
  materials,
  onEdit,
  onDelete,
}: {
  materials: Materiel[];
  onEdit: (material: Materiel) => void;
  onDelete: (material: Materiel) => void;
}) {
  if (materials.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-gray-300" />

        <h2 className="mt-3 font-semibold text-gray-900">
          Aucun matériel
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Aucun matériel n'a encore été enregistré.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="hidden grid-cols-6 border-b bg-gray-50 p-4 text-sm font-semibold text-gray-700 md:grid">
        <span>Matériel</span>
        <span>Description</span>
        <span>Quantité</span>
        <span>Prix unitaire</span>
        <span>État</span>
        <span className="text-right">Actions</span>
      </div>

      {materials.map((material) => (
        <div
          key={material.id}
          className="border-b p-4 last:border-b-0"
        >
          <div className="grid gap-3 md:grid-cols-6 md:items-center">
            <div>
              <p className="font-medium text-gray-900">
                {material.name}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {material.description || "Aucune description"}
            </div>

            <div>
              <span className="font-medium text-gray-900">
                {material.quantity_available}
              </span>
            </div>

            <div className="text-sm text-gray-700">
              {formatPrice(material.unit_price)}
            </div>

            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  material.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {material.is_active ? "Disponible" : "Inactif"}
              </span>
            </div>

            <div className="flex justify-start gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => onEdit(material)}
                className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(material)}
                className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}