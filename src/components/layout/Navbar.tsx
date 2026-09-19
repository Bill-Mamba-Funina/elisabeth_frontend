"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const currentPage =
    pathname === "/dashboard"
      ? "Tableau de bord"
      : pathname.startsWith("/clients")
        ? "Clients"
        : pathname.startsWith("/reservations")
          ? "Réservations"
          : pathname.startsWith("/evenements")
            ? "Événements"
            : pathname.startsWith("/salles")
              ? "Salles"
              : pathname.startsWith("/services")
                ? "Services"
                : pathname.startsWith("/personnel")
                  ? "Personnel"
                  : pathname.startsWith("/finances")
                    ? "Finances"
                    : pathname.startsWith("/calendrier")
                      ? "Calendrier"
                      : pathname.startsWith("/documents")
                        ? "Documents"
                        : pathname.startsWith("/notifications")
                          ? "Notifications"
                          : pathname.startsWith("/rapports")
                            ? "Rapports"
                            : pathname.startsWith("/administration")
                              ? "Administration"
                              : "Elisabeth";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">

        {/* Partie gauche */}
        <div>
          <h1 className="text-lg font-semibold text-white">
            {currentPage}
          </h1>

          <p className="hidden text-xs text-slate-400 sm:block">
            La Casa da Festa Elisabeth
          </p>
        </div>

        {/* Partie droite */}
        <div className="flex items-center gap-4">

          <Link
            href="/notifications"
            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            🔔
          </Link>

          <Link
            href="/administration"
            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            ⚙️
          </Link>

        </div>
      </div>
    </header>
  );
}
