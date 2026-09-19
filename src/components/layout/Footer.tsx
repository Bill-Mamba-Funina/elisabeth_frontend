export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-6 py-5">
      <div className="text-center text-sm text-slate-500">
        © {new Date().getFullYear()} La Casa da Festa Elisabeth.
        Tous droits réservés.
      </div>
    </footer>
  );
}
