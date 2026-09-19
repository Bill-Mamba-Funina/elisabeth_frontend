"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>⚙️ Administration & rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            MVP : vous avez déjà le dashboard + calendrier + finances.
            Pour les rapports (mensuel/journalier, graphiques, salles les plus utilisées),
            on ajoutera des endpoints dédiés dans le backend + une UI Chart.js ici.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
