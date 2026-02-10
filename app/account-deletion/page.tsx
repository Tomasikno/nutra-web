import { buildCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

const effectiveDate = "10. února 2026";

export const metadata: Metadata = {
  title: "Nutra - Smazání účtu",
  description:
    "Postup, jak požádat o smazání účtu Nutra a přidružených dat, včetně informací o retenci.",
  alternates: {
    canonical: buildCanonicalUrl("/account-deletion"),
  },
  openGraph: {
    url: buildCanonicalUrl("/account-deletion"),
    title: "Nutra - Smazání účtu",
    description:
      "Postup, jak požádat o smazání účtu Nutra a přidružených dat, včetně informací o retenci.",
  },
};

export default function AccountDeletionPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14 text-foreground lg:px-10 lg:py-20">
      <div className="rounded-3xl border border-forest-green/20 bg-white/85 p-7 shadow-[0_20px_55px_-35px_rgba(28,51,37,0.65)] backdrop-blur-sm sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Nutra
        </p>
        <h1 className="display-type text-4xl font-bold text-forest-green sm:text-5xl">
          Žádost o smazání účtu a dat
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          Tato stránka slouží jako veřejný odkaz pro Google Play. Popisuje, jak v aplikaci{" "}
          <strong>Nutra</strong> požádat o smazání účtu a jakým způsobem jsou data po podání
          žádosti zpracovávána.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-forest-green">Jak požádat o smazání účtu</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
            <li>
              Přihlaste se do aplikace Nutra a otevřete:{" "}
              <strong>Profil - Nastavení - Účet - Smazat účet</strong>.
            </li>
            <li>Potvrďte žádost o smazání účtu.</li>
            <li>
              Pokud se nelze přihlásit, lze žádost odeslat přes kontakt vývojáře uvedený v Google
              Play u aplikace Nutra a uvést e-mail účtu, kterého se žádost týká.
            </li>
          </ol>
          <p className="mt-4 text-sm text-slate-600">
            Obvyklá doba vyřízení je do 30 dnů od ověření vlastnictví účtu.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-forest-green">Data, která budou smazána</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>účet a profil uživatele v aplikaci Nutra,</li>
            <li>záznamy o jídlech, cílech, preferencích a souvisejících nastaveních,</li>
            <li>uložené recepty, oblíbené položky a další obsah vytvořený uživatelem v aplikaci.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-forest-green">Data, která mohou být dočasně uchována</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>
              bezpečnostní a provozní logy, typicky maximálně <strong>30 dní</strong>,
            </li>
            <li>
              zálohy systému, kde se odstranění může projevit se zpožděním, obvykle{" "}
              <strong>30 až 90 dní</strong>,
            </li>
            <li>
              transakční nebo účetní data vyžadovaná právními předpisy (např. informace o nákupech
              a předplatném), po dobu danou zákonem.
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Platební údaje zpracovávají primárně poskytovatelé plateb (Google Play / Apple App
            Store) a související služby.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-forest-green">Související dokumenty</h2>
          <p className="mt-4 text-slate-700">
            Podrobnosti o ochraně osobních údajů jsou uvedeny v dokumentu{" "}
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-3 text-sm text-slate-600">Účinnost dokumentu: {effectiveDate}.</p>
        </section>
      </div>
    </main>
  );
}
