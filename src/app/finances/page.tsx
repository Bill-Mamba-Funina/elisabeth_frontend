"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    api.get("/payments/?page_size=20").then((res) => setPayments(res.data.results ?? res.data));
    api.get("/expenses/?page_size=20").then((res) => setExpenses(res.data.results ?? res.data));
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>💰 Paiements (derniers)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {payments.slice(0,10).map((p) => (
              <li key={p.id} className="text-sm text-white/90">
                {p.receipt_number} — {p.amount} {p.mode} — {p.date}
              </li>
            ))}
            {payments.length === 0 && <li className="text-white/60">Aucun paiement</li>}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>💸 Dépenses (dernières)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {expenses.slice(0,10).map((e) => (
              <li key={e.id} className="text-sm text-white/90">
                {e.category?.name || "-"} — {e.amount} — {e.date}
              </li>
            ))}
            {expenses.length === 0 && <li className="text-white/60">Aucune dépense</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
