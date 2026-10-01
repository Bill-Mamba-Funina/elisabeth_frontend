"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Search, X } from "lucide-react";

export interface Client {
  id: number | string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

interface ClientTableProps {
  clients: Client[];
}

function normalizePhone(phone?: string | null): string {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

export default function ClientTable({
  clients,
}: ClientTableProps) {
  const [search, setSearch] = useState("");

  /*
   * ============================================================
   * CLIENTS UNIQUES
   * ============================================================
   *
   * Le téléphone est utilisé comme identifiant métier.
   *
   * Deux réservations avec le même téléphone
   * doivent afficher un seul client.
   */
  const uniqueClients = useMemo(() => {
    const map = new Map<string, Client>();

    clients.forEach((client) => {
      const phone = normalizePhone(client.phone);

      const key = phone
        ? `phone-${phone}`
        : `id-${String(client.id)}`;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...client,
        });

        return;
      }

      /*
       * Complète les informations existantes
       * sans créer un deuxième client.
       */
      map.set(key, {
        ...existing,

        full_name:
          existing.full_name?.trim() ||
          client.full_name?.trim() ||
          "",

        phone:
          existing.phone?.trim() ||
          client.phone?.trim() ||
          "",

        email:
          existing.email?.trim() ||
          client.email?.trim() ||
          "",

        address:
          existing.address?.trim() ||
          client.address?.trim() ||
          "",

        notes:
          existing.notes?.trim() ||
          client.notes?.trim() ||
          "",
      });
    });

    return Array.from(map.values());
  }, [clients]);

  /*
   * ============================================================
   * RECHERCHE
   * ============================================================
   */
  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return uniqueClients;
    }

    return uniqueClients.filter((client) => {
      const name =
        client.full_name?.toLowerCase() ?? "";

      const phone =
        client.phone?.toLowerCase() ?? "";

      const email =
        client.email?.toLowerCase() ?? "";

      const address =
        client.address?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        address.includes(query)
      );
    });
  }, [uniqueClients, search]);

  function clearSearch(): void {
    setSearch("");
  }

  return (
    <div className="space-y-4">
      {/* ========================================================
          FILTRE
      ======================================================== */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher par nom, téléphone, email ou adresse..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              title="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="text-sm text-slate-400">
          {filteredClients.length} client
          {filteredClients.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* ========================================================
          TABLEAU
      ======================================================== */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-950">
            <tr className="border-b border-slate-800">
              <th className="px-5 py-3 text-slate-400">
                N°
              </th>

              <th className="px-5 py-3 text-slate-400">
                Client
              </th>

              <th className="px-5 py-3 text-slate-400">
                Téléphone (WhatsApp)
              </th>

              <th className="px-5 py-3 text-slate-400">
                Email (Gmail)
              </th>

              <th className="px-5 py-3 text-slate-400">
                Adresse
              </th>

              <th className="px-5 py-3 text-right text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  {search
                    ? "Aucun client ne correspond à votre recherche."
                    : "Aucun client enregistré."}
                </td>
              </tr>
            ) : (
              filteredClients.map((client, index) => {
                const cleanPhone =
                  normalizePhone(client.phone);

                const whatsappUrl = cleanPhone
                  ? `https://wa.me/${cleanPhone}`
                  : null;

                const email =
                  client.email?.trim() || "";

                const gmailUrl = email
                  ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      email
                    )}`
                  : null;

                return (
                  <tr
                    key={
                      cleanPhone
                        ? `client-phone-${cleanPhone}`
                        : `client-id-${client.id}`
                    }
                    className="border-b border-slate-800 transition hover:bg-slate-800/50"
                  >
                    {/* N° */}
                    <td className="px-5 py-4 font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* CLIENT */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">
                        {client.full_name || "-"}
                      </div>
                    </td>

                    {/* TELEPHONE */}
                    <td className="px-5 py-4 text-slate-300">
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                          title="Ouvrir dans WhatsApp"
                        >
                          <Phone className="h-3.5 w-3.5" />

                          {client.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4 text-slate-300">
                      {gmailUrl ? (
                        <a
                          href={gmailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-400 transition hover:text-blue-300 hover:underline"
                          title="Envoyer un e-mail via Gmail"
                        >
                          <Mail className="h-3.5 w-3.5" />

                          {email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* ADRESSE */}
                    <td className="px-5 py-4 text-slate-300">
                      {client.address || "-"}
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-blue-400 transition hover:text-blue-300 hover:underline"
                      >
                        Historique 
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

