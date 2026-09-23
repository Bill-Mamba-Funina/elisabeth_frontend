"use client";

import { useState } from "react";

// 1. Définir une interface au lieu d'utiliser "any"
interface ReservationDay {
  date: string; // ex: "2023-10-25"
  // ajoute d'autres propriétés ici (ex: events: any[])
}

export default function ReservationsPage() {
  const [days, setDays] = useState<ReservationDay[]>([]);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      
      {/* 2. Ajout de grid-cols-7 pour aligner les 7 jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-white/60 text-center font-semibold">
            {d}
          </div>
        ))}
      </div>

      {/* Grille pour les cases des jours */}
      <div className="grid grid-cols-7 gap-2">
        {days?.map((day) => (
          <div 
            key={day.date} 
            className="border border-white/10 rounded p-2 min-h-[78px] bg-white/[0.02]"
          >
            <div className="text-white/80 text-right">
              {/* 3. Sécurisation du split au cas où la date serait mal formatée par le backend */}
              {day.date ? Number(day.date.split("-")[2]) : ""}
            </div>

            <div className="mt-2 space-y-1">
              {/* Contenu du jour */}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}