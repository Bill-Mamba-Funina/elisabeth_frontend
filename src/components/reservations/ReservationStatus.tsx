"use client";

import React from "react";

interface ReservationStatusProps {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: "NON_PAYE" | "PARTIEL" | "PAYE";
}

export default function ReservationStatus({
  totalAmount,
  paidAmount,
  remainingAmount,
  paymentStatus,
}: ReservationStatusProps) {
  const getBadgeClass = () => {
    switch (paymentStatus) {
      case "PAYE":
        return "bg-green-100 text-green-700 border-green-200";

      case "PARTIEL":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "NON_PAYE":
      default:
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const getLabel = () => {
    switch (paymentStatus) {
      case "PAYE":
        return "Payé";

      case "PARTIEL":
        return "Partiel";

      case "NON_PAYE":
      default:
        return "Non payé";
    }
  };

  return (
    <div className="min-w-[180px] space-y-2">
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getBadgeClass()}`}
      >
        {getLabel()}
      </span>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Total</span>

          <span className="font-medium text-gray-700">
            {totalAmount.toLocaleString("fr-FR")} $
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Payé</span>

          <span className="font-medium text-green-600">
            {paidAmount.toLocaleString("fr-FR")} $
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Reste</span>

          <span className="font-medium text-red-600">
            {remainingAmount.toLocaleString("fr-FR")} $
          </span>
        </div>
      </div>
    </div>
  );
}