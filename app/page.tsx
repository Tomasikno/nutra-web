import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background-light text-slate-900 antialiased">
      <header className="glass-header fixed left-0 right-0 top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
              <Image
                src="/logo.svg"
                alt="Nutra logo"
                width={32}
                height={32}
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-forest-green">
              Nutra
            </h1>
          </div>
          <nav className="hidden items-center gap-10 md:flex">
            <a
              className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
              href="#"
            >
              Features
            </a>
            <a
              className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
              href="#"
            >
              How it Works
            </a>
            <a
              className="text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green"
              href="#pricing"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              className="hidden px-4 py-2 text-sm font-semibold text-forest-green/80 transition-colors hover:text-forest-green sm:block"
              href="/admin"
            >
              Log In
            </Link>
            <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90">
              Download Now
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-cream-beige pb-24 pt-48">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-forest-green/10 blur-3xl -ml-32"></div>
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl -mr-48"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          <h1 className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-forest-green lg:text-8xl">
            Your Personal Nutritionist{" "}
            <br className="hidden lg:block" /> in Your Pocket
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-forest-green/70">
            Custom meal plans, smart shopping lists, and AI-powered nutritional
            insights tailored just for you. Transform your relationship with
            food today.
          </p>
          <div className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <button className="w-full transform rounded-2xl bg-primary px-10 py-5 text-xl font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/90 sm:w-auto">
              Download Now
            </button>
            <button className="w-full rounded-2xl border border-forest-green/30 bg-white/40 px-10 py-5 text-xl font-semibold text-forest-green transition-all hover:bg-white/70 sm:w-auto">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-beige/60 bg-background-light py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-forest-green">
              Tailored for Your Health
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to master your nutrition in one app.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "calendar_today",
                title: "Weekly Meal Plan",
                copy: "Personalized schedules based on your specific health goals and dietary preferences.",
              },
              {
                icon: "shopping_cart",
                title: "Shopping List",
                copy: "Auto-generated lists from your meal choices to save you time and reduce food waste.",
              },
              {
                icon: "cooking",
                title: "Meal Analysis",
                copy: "Instant calorie and macro tracking for everything you eat with advanced photo scanning.",
              },
              {
                icon: "magic_button",
                title: "AI Suggestions",
                copy: "Smart, healthy alternatives for your favorite cravings using generative AI coaching.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-cream-beige/70 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-forest-green/10 text-forest-green transition-colors group-hover:bg-forest-green group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">
                    {item.icon}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-forest-green">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-beige/40 py-24" id="pricing">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-forest-green">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Choose the plan that fits your health journey.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-cream-beige/60 bg-white p-8 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-forest-green">
                Free
              </h3>
              <div className="mb-6 text-3xl font-extrabold text-forest-green">
                $0
                <span className="text-base font-normal text-slate-500">
                  /mo
                </span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                {[
                  "Basic Meal Planning",
                  "Manual Shopping List",
                  "Calorie Tracking",
                ].map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm text-forest-green">
                      check_circle
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-xl border border-forest-green/40 py-3 font-semibold text-forest-green transition-colors hover:bg-forest-green/5">
                Start for Free
              </button>
            </div>
            <div className="relative z-10 flex scale-105 flex-col rounded-2xl border-2 border-primary bg-white p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                Most Popular
              </div>
              <h3 className="mb-2 text-lg font-bold text-forest-green">
                Pro
              </h3>
              <div className="mb-6 text-3xl font-extrabold text-forest-green">
                $9.99
                <span className="text-base font-normal text-slate-500">
                  /mo
                </span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                {[
                  "AI-Powered Meal Analysis",
                  "Automated Shopping Lists",
                  "Detailed Macro Insights",
                  "Custom Diet Preferences",
                ].map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">
                      check_circle
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                Go Pro
              </button>
            </div>
            <div className="flex flex-col rounded-2xl border border-cream-beige/60 bg-white p-8 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-forest-green">
                Life
              </h3>
              <div className="mb-6 text-3xl font-extrabold text-forest-green">
                $149
                <span className="text-base font-normal text-slate-500">
                  /once
                </span>
              </div>
              <ul className="mb-8 flex-grow space-y-4">
                {[
                  "Lifetime Pro Access",
                  "Priority AI Features",
                  "Exclusive Community Access",
                ].map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm text-forest-green">
                      check_circle
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-xl border border-forest-green/40 py-3 font-semibold text-forest-green transition-colors hover:bg-forest-green/5">
                One-time Buy
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-light px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-forest-green to-emerald-800 px-8 py-16 text-center text-white lg:py-24">
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-6 text-4xl font-black lg:text-5xl">
                Start Your Journey Today
              </h2>
              <p className="mb-10 text-lg leading-relaxed opacity-90">
                Join thousands of users who have transformed their relationship
                with food and achieved their fitness goals with Nutra.
              </p>
              <button className="rounded-xl bg-white px-10 py-4 text-lg font-semibold text-forest-green shadow-lg transition-all hover:bg-slate-100 active:scale-95 hover:scale-105">
                Join for Free
              </button>
            </div>
            <div className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl"></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-background-light pb-10 pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cream-beige shadow-sm">
                  <Image
                    src="/logo.svg"
                    alt="Nutra logo"
                    width={28}
                    height={28}
                  />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-forest-green">
                  Nutra
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Empowering you to live your healthiest life through smart,
                personalized nutrition.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Success Stories", "AI Coaching", "For Teams"],
              },
              {
                title: "Resources",
                links: ["Help Center", "Blog", "Community", "Nutrition Guide"],
              },
              {
                title: "Company",
                links: [
                  "About Us",
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="mb-6 font-bold text-forest-green">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        className="text-sm text-slate-500 transition-colors hover:text-primary"
                        href="#"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
            <p className="text-xs text-slate-400">
              © 2024 Nutra App. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-400">
                Proudly built with Kotlin Multiplatform
              </span>
              <span className="material-symbols-outlined text-lg text-slate-400">
                language
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
