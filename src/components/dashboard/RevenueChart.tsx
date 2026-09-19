"use client";

const data = [
  { mois: "Jan", value: 4500 },
  { mois: "Fév", value: 6200 },
  { mois: "Mar", value: 5100 },
  { mois: "Avr", value: 7900 },
  { mois: "Mai", value: 6800 },
  { mois: "Juin", value: 9200 },
];

export default function RevenueChart() {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold">Évolution des recettes</h2>

      <div className="mt-6 flex h-56 items-end gap-4">
        {data.map((item) => (
          <div key={item.mois} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs text-gray-500">{item.value}$</span>
            <div
              className="w-full rounded-t-lg bg-green-500"
              style={{ height: `${(item.value / max) * 100}%` }}
            />
            <span className="text-xs text-gray-500">{item.mois}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
