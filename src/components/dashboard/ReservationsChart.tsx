"use client";

const data = [
  { mois: "Jan", value: 12 },
  { mois: "Fév", value: 18 },
  { mois: "Mar", value: 14 },
  { mois: "Avr", value: 25 },
  { mois: "Mai", value: 20 },
  { mois: "Juin", value: 31 },
];

export default function ReservationsChart() {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Réservations</h2>

      <div className="mt-6 flex h-56 items-end gap-4">
        {data.map((item) => (
          <div key={item.mois} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs text-gray-500">{item.value}</span>
            <div
              className="w-full rounded-t-lg bg-blue-500"
              style={{ height: `${(item.value / max) * 100}%` }}
            />
            <span className="text-xs text-gray-500">{item.mois}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
