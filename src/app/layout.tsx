import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "La Casa da Festa Elisabeth",
  description: "Application de gestion de salle de fêtes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-slate-950 text-white">
          <div className="flex min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Contenu principal */}
            <div className="flex min-w-0 flex-1 flex-col">

              {/* Navbar */}
              <Navbar />

              {/* Pages */}
              <main className="min-w-0 flex-1 p-4 md:p-6">
                {children}
              </main>

              {/* Footer */}
              <Footer />

            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

