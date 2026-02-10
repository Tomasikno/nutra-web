import { buildCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

const effectiveDate = "10. února 2026";

export const metadata: Metadata = {
  title: "Nutra - Privacy Policy",
  description:
    "Zásady ochrany osobních údajů aplikace Nutra včetně rozsahu zpracování, retence a práv uživatelů.",
  alternates: {
    canonical: buildCanonicalUrl("/privacy-policy"),
  },
  openGraph: {
    url: buildCanonicalUrl("/privacy-policy"),
    title: "Nutra - Privacy Policy",
    description:
      "Zásady ochrany osobních údajů aplikace Nutra včetně rozsahu zpracování, retence a práv uživatelů.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14 text-foreground lg:px-10 lg:py-20">
      <div className="rounded-3xl border border-forest-green/20 bg-white/85 p-7 shadow-[0_20px_55px_-35px_rgba(28,51,37,0.65)] backdrop-blur-sm sm:p-10">
        <p className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Nutra
        </p>
        <h1 className="display-type text-4xl font-bold text-forest-green sm:text-5xl">
          Zásady ochrany osobních údajů
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          Tento dokument popisuje, jak aplikace <strong>Nutra</strong> zpracovává osobní údaje,
          jaké kategorie dat používá, jak dlouho jsou data uchovávána a jaká práva lze uplatnit.
        </p>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">1. Správce a kontakt</h2>
          <p>
            Správcem osobních údajů je vývojář aplikace Nutra uvedený v záznamu aplikace na Google
            Play.
          </p>
          <p>
            Kontakt pro žádosti k osobním údajům (přístup, oprava, výmaz) je uveden v sekci
            vývojáře na Google Play.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">2. Jaké údaje se zpracovávají</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>identifikační a přihlašovací údaje (např. e-mail, technické ID uživatele),</li>
            <li>profilové údaje a cíle související s výživou,</li>
            <li>záznamy o jídlech, receptech, oblíbených položkách a nastaveních,</li>
            <li>technické a bezpečnostní logy potřebné pro provoz a ochranu služby,</li>
            <li>údaje o předplatném poskytované partnery pro platby a entitlement.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">3. Účely zpracování</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>provoz uživatelského účtu a funkcí aplikace,</li>
            <li>synchronizace a zálohování uživatelských dat mezi zařízeními,</li>
            <li>personalizace doporučení a analytických funkcí v aplikaci,</li>
            <li>zabezpečení, prevence zneužití a řešení technických incidentů,</li>
            <li>splnění právních povinností souvisejících s provozem služby.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">4. Sdílení dat</h2>
          <p>
            Data mohou být zpracovávána smluvními zpracovateli, kteří zajišťují technický provoz
            aplikace, databázové služby, AI funkce a předplatné. Tito zpracovatelé zpracovávají
            data pouze v rozsahu potřebném pro poskytování služby.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">5. Doba uchování dat</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>uživatelská data jsou uchovávána po dobu existence účtu nebo do jejich výmazu,</li>
            <li>bezpečnostní logy jsou typicky uchovávány maximálně 30 dní,</li>
            <li>zálohy mohou uchovávat data 30 až 90 dní,</li>
            <li>
              údaje, které je správce povinen uchovávat ze zákona, jsou drženy po zákonem
              stanovenou dobu.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-forest-green">6. Vaše práva</h2>
          <p>
            Uživatel má právo na přístup k osobním údajům, opravu, omezení zpracování,
            přenositelnost a výmaz. Dále má právo podat stížnost u příslušného dozorového úřadu.
          </p>
          <p>
            O smazání účtu a přidružených dat lze požádat podle postupu na stránce{" "}
            <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/account-deletion">
              Account Deletion
            </Link>
            .
          </p>
        </section>

        <p className="mt-12 border-t border-slate-200 pt-5 text-sm text-slate-600">
          Účinnost dokumentu: {effectiveDate}. Tento dokument může být aktualizován.
        </p>
      </div>
    </main>
  );
}
