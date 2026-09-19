"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard/").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-white/70">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Réservations" value={data.reservations_week} />
        <StatCard title="Revenus" value={`${data.revenue_month} $`} />
        <StatCard title="Solde à payer" value={`${data.remaining_total} $`} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Événements cette semaine" value={data.events_week_count} />
        <StatCard title="Clients actifs" value={data.active_clients} />
        <StatCard title="Dépenses du mois" value={`${data.expenses_month} $`} />
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(data.alerts || []).map((a: string, idx: number) => (
              <li key={idx} className="text-white/90">{a}</li>
            ))}
            {(!data.alerts || data.alerts.length === 0) && <li className="text-white/60">Aucune alerte.</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-sm text-white/70">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
