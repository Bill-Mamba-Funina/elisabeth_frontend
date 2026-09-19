const notifications = [
  { id: 1, titre: "Réservation confirmée", message: "Votre réservation de la salle a été confirmée.", date: "Aujourd'hui", lu: false },
  { id: 2, titre: "Paiement reçu", message: "Votre paiement a été enregistré.", date: "Hier", lu: true },
  { id: 3, titre: "Rappel", message: "N'oubliez pas votre événement prévu prochainement.", date: "15/09/2026", lu: true },
];

export default function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-gray-500">Les informations concernant vos réservations.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-xl border bg-white p-5 ${
              !notification.lu ? "border-blue-300 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{notification.titre}</h2>
                <p className="mt-1 text-gray-600">{notification.message}</p>
              </div>
              <span className="text-sm text-gray-400">{notification.date}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
