"use client";

import React from "react";

interface ReservationStatusProps {
totalAmount: number | string;
paidAmount: number | string;
remainingAmount: number | string;
paymentStatus:
| "NON_PAYE"
| "PARTIEL"
| "PAYE";
}

export default function ReservationStatus({
totalAmount,
paidAmount,
remainingAmount,
paymentStatus,
}: ReservationStatusProps) {
const total = Number(totalAmount || 0);
const paid = Number(paidAmount || 0);
const remaining = Number(remainingAmount || 0);

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

return ( <div className="min-w-[180px] space-y-2">
<span
className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getBadgeClass()}`}
>
{getLabel()} </span>


  <div className="space-y-1 text-xs">
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">
        Total
      </span>

      <span className="font-medium text-gray-700">
        {total.toLocaleString("fr-FR")} $
      </span>
    </div>

    <div className="flex justify-between gap-3">
      <span className="text-gray-500">
        Payé
      </span>

      <span className="font-medium text-green-600">
        {paid.toLocaleString("fr-FR")} $
      </span>
    </div>

    <div className="flex justify-between gap-3">
      <span className="text-gray-500">
        Reste
      </span>

      <span
        className={`font-medium ${
          remaining > 0
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {remaining.toLocaleString("fr-FR")} $
      </span>
    </div>
  </div>
</div>


);
}
