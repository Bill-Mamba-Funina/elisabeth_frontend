"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    label: "Calendrier",
    href: "/calendrier",
    icon: "📅",
  },
  {
    label: "Réservations",
    href: "/reservations",
    icon: "📋",
  },
  {
    label: "Événements",
    href: "/evenements",
    icon: "🎉",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: "👥",
  },
  {
    label: "Salles",
    href: "/salles",
    icon: "🏛️",
  },
  {
    label: "Tarifs",
    href: "/tarifs",
    icon: "🏷️",
  },
  {
    label: "Personnel",
    href: "/personnel",
    icon: "👨‍💼",
  },
  {
    label: "Matériel",
    href: "/materiel",
    icon: "📦",
  },
  {
    label: "Dépenses",
    href: "/finances/depenses",
    icon: "💸",
  },
  {
    label: "Paiements",
    href: "/finances/paiements",
    icon: "💰",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "🔔",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-900 lg:flex lg:min-h-screen lg:flex-col">
      {/* Logo */}
      <div className="border-b border-white/10 p-5">
        <Link href="/dashboard">
          <div className="text-xl font-bold text-white">
            Elisabeth
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Gestion de salle de fêtes
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">
                {link.icon}
              </span>

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bas du Sidebar */}
      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Elisabeth
        </p>
      </div>
    </aside>
  );
}

