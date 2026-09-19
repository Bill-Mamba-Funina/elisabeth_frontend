import Link from "next/link";

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            Espace client
          </h1>

          <Link
            href="/dashboard"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Tableau de bord
          </Link>
        </div>
      </header>

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-6 px-6 py-3">
          <Link
            href="/clients/reservations"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Reservations
          </Link>

          <Link
            href="/clients/paiements"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Paiements
          </Link>

          <Link
            href="/clients/documents"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Documents
          </Link>

          <Link
            href="/clients/notifications"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Notifications
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}

