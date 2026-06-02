"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-16 text-stone-900">
      <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Mode hors ligne
        </p>
        <h1 className="mb-4 font-[var(--font-playfair)] text-4xl leading-tight text-stone-950">
          La connexion est indisponible pour le moment.
        </h1>
        <p className="mb-8 text-base leading-7 text-stone-600">
          L'application reste installable et certaines ressources deja chargees sont encore accessibles. Reessayez des que la connexion revient.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Revenir a l'accueil
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
          >
            Reessayer
          </button>
        </div>
      </div>
    </main>
  );
}