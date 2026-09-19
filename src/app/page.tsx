export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-white/10 p-6 bg-white/5">
        <h1 className="text-2xl font-bold mb-2">Elisabeth</h1>
        <p className="text-white/70 mb-6">Connexion requise.</p>
        <a href="/login" className="underline text-sky-300">Aller à la connexion</a>
      </div>
    </div>
  );
}
