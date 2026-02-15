import Reveal from "@/app/components/Reveal";
import Image from "next/image";
import Link from "next/link";

type PublicFooterLink = {
  label: string;
  href: string;
};

type PublicFooterSection = {
  title: string;
  links: PublicFooterLink[];
};

type PublicFooterProps = {
  logoAlt: string;
  description: string;
  sections: PublicFooterSection[];
  copyright: string;
  builtWith: string;
};

export default function PublicFooter({
  logoAlt,
  description,
  sections,
  copyright,
  builtWith,
}: PublicFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-background-light pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
                  <Image src="/logo.png" alt={logoAlt} width={32} height={32} />
                </div>
                <h2 className="display-type text-2xl font-bold text-forest-green">Nutra</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{description}</p>
            </div>

            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="mb-6 font-bold text-forest-green">{section.title}</h4>
                <nav aria-label={section.title}>
                  <ul className="space-y-4">
                    {section.links.map((link) => (
                      <li key={`${section.title}-${link.label}`}>
                        <Link className="text-sm text-slate-600 transition-colors hover:text-primary" href={link.href}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-xs text-slate-600">{copyright}</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">{builtWith}</span>
            <span aria-hidden="true" className="material-symbols-outlined text-lg text-slate-600">language</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
