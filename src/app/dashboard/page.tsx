"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ReservationsChart from "@/components/dashboard/ReservationsChart";
import Alerts from "@/components/dashboard/Alerts";

interface DashboardStats {
  totalReservations: number;
  chiffreAffairesTotal: number;
  totalEncaisse: number;
  resteARecouvrer: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    chiffreAffairesTotal: 0,
    totalEncaisse: 0,
    resteARecouvrer: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [resReservations, resPaiements] =
          await Promise.allSettled([
            api.get(API_ROUTES.RESERVATIONS),
            api.get(API_ROUTES.FINANCES.PAIEMENTS),
          ]);

        let reservationsList: any[] = [];
        let paiementsList: any[] = [];

        if (
          resReservations.status === "fulfilled" &&
          Array.isArray(resReservations.value.data)
        ) {
          reservationsList = resReservations.value.data;
        }

        if (
          resPaiements.status === "fulfilled" &&
          Array.isArray(resPaiements.value.data)
        ) {
          paiementsList = resPaiements.value.data;
        }

        const caTotal = reservationsList.reduce(
          (acc: number, item: any) =>
            acc + (Number(item.total_amount) || 0),
          0
        );

        const encaisseTotal = paiementsList.reduce(
          (acc: number, item: any) =>
            acc + (Number(item.montant) || 0),
          0
        );

        const resteRecouvrer = Math.max(
          0,
          caTotal - encaisseTotal
        );

        setStats({
          totalReservations: reservationsList.length,
          chiffreAffairesTotal: caTotal,
          totalEncaisse: encaisseTotal,
          resteARecouvrer: resteRecouvrer,
        });
      } catch (err: any) {
        console.warn(
          "Chargement partiel du tableau de bord :",
          err?.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Chargement du tableau de bord...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Tableau de Bord - Elisabeth
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'Affaires Engage"
          value={`${stats.chiffreAffairesTotal.toLocaleString()} $`}
          description="Montant total des contrats"
        />

        <StatCard
          title="Total Reellement Encaisse"
          value={`${stats.totalEncaisse.toLocaleString()} $`}
          description="Paiements confirmes recus"
        />

        <StatCard
          title="Reste a Recouvrer"
          value={`${stats.resteARecouvrer.toLocaleString()} $`}
          description="Solde du par les clients"
        />

        <StatCard
          title="Reservations Total"
          value={stats.totalReservations.toString()}
          description="Evenements enregistres"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div>
          <p className="text-xs text-gray-500">
            Caisse Physique
          </p>

          <p className="text-lg font-bold text-gray-800">
            {stats.totalEncaisse.toLocaleString()} $
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Compte Bancaire
          </p>

          <p className="text-lg font-bold text-blue-600">
            0 $
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Mobile Money
          </p>

          <p className="text-lg font-bold text-amber-600">
            0 $
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <ReservationsChart />
        </div>

        <div>
          <Alerts />
        </div>
      </div>
    </div>
  );
}