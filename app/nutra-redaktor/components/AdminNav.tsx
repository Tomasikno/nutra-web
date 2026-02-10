"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavProps = {
  sessionEmail: string;
  onSignOut: () => void;
};

export default function AdminNav({ sessionEmail, onSignOut }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-sm text-zinc-400">Signed in as</p>
          <p className="text-base font-semibold text-white">{sessionEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nutra-redaktor"
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              isActive("/nutra-redaktor")
                ? "border-emerald-400 text-emerald-100"
                : "border-zinc-700 text-zinc-300 hover:border-emerald-400 hover:text-emerald-200"
            }`}
          >
            Create Recipe
          </Link>
          <Link
            href="/nutra-redaktor/recipes"
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              isActive("/nutra-redaktor/recipes")
                ? "border-emerald-400 text-emerald-100"
                : "border-zinc-700 text-zinc-300 hover:border-emerald-400 hover:text-emerald-200"
            }`}
          >
            Recipes
          </Link>
          <Link
            href="/nutra-redaktor/premium-config"
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              isActive("/nutra-redaktor/premium-config")
                ? "border-emerald-400 text-emerald-100"
                : "border-zinc-700 text-zinc-300 hover:border-emerald-400 hover:text-emerald-200"
            }`}
          >
            Premium Config
          </Link>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
      >
        Sign Out
      </button>
    </div>
  );
}
