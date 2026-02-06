import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 font-sans text-zinc-900">
      <main className="flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-500">
            Nutra Admin
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900 md:text-5xl">
            Manage recipes and premium access in one place.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            Sign in as an admin to create new recipes and tune premium
            configuration directly in Supabase.
          </p>
        </header>
        <div className="flex flex-col gap-6 rounded-2xl bg-zinc-50 p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-zinc-900">Admin Console</h2>
            <p className="text-zinc-600">
              Use secure credentials to access recipe tools and premium settings.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              href="/admin"
            >
              Go to Admin Login
            </Link>
            <div className="flex items-center rounded-full border border-zinc-200 px-5 py-3 text-sm text-zinc-500">
              Powered by Supabase
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
