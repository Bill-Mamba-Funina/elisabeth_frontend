"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReservationsPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9);
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/calendar/${year}/${month}/`).then((res) => setDays(res.data.days));
  }, [year, month]);

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>📅 Calendrier</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <div className="text-sm text-white/70">Mois/année</div>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 w-24"
          />
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 w-28"
          />
          <div className="text-sm text-white/60">Calendrier MVP (événements par jour)</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-7 gap-2 text-xs">
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d) => (
          <div key={d} className="text-white/60 text-center">{d}</div>
        ))}
        {days.map((day) => (
          <div key={day.date} className="border border-white/10 rounded p-2 min-h-[78px] bg-white/[0.02]">
            <div className="text-white/80 text-right">{Number(day.date.split("-")[2])}</div>
            <div className="mt-2 space-y-1">
              {(day.items || []).slice(0,2).map((it: any) => (
                <div key={it.id} className="text-[11px] text-sky-200 leading-tight">
                  {it.event_type} — {it.hall}
                </div>
              ))}
              {(day.items || []).length > 2 && (
                <div className="text-[11px] text-white/60">+{(day.items || []).length-2}...</div>
              )}
              {(day.items || []).length === 0 && <div className="text-[11px] text-white/40">Libre</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
