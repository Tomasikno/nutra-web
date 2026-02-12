"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNav from "../components/AdminNav";

type PremiumConfigRow = {
  feature_slug: string;
  display_name: string;
  free_monthly_limit: number;
  is_premium_only: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type RowDraft = {
  display_name: string;
  free_monthly_limit: string;
  is_premium_only: boolean;
};

type PremiumConfigClientProps = {
  initialSessionEmail: string | null;
  initialConfigured: boolean;
};

export default function PremiumConfigClient({
  initialSessionEmail,
  initialConfigured,
}: PremiumConfigClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(
    initialSessionEmail
  );
  const [configured] = useState(initialConfigured);

  const [rows, setRows] = useState<PremiumConfigRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [newDraft, setNewDraft] = useState<{
    feature_slug: string;
    display_name: string;
    free_monthly_limit: string;
    is_premium_only: boolean;
  }>({
    feature_slug: "",
    display_name: "",
    free_monthly_limit: "5",
    is_premium_only: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const statusMessage = useMemo(
    () =>
      configured
        ? null
        : "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your server environment to enable admin actions.",
    [configured]
  );

  // Session and config are provided by the server to avoid UI flicker.

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/premium-config");
    const payload = (await response.json()) as {
      data?: PremiumConfigRow[];
      message?: string;
    };

    if (!response.ok) {
      setError(payload.message ?? "Unable to load premium config.");
      setLoading(false);
      return;
    }

    const data = payload.data ?? [];
    setRows(data);
    const nextDrafts = data.reduce<Record<string, RowDraft>>((acc, row) => {
      acc[row.feature_slug] = {
        display_name: row.display_name,
        free_monthly_limit: String(row.free_monthly_limit ?? 0),
        is_premium_only: Boolean(row.is_premium_only),
      };
      return acc;
    }, {});
    setDrafts(nextDrafts);
    setLoading(false);
  };

  useEffect(() => {
    if (!sessionEmail) return;
    const timeout = window.setTimeout(() => {
      void fetchRows();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [sessionEmail]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as { email?: string | null; message?: string };

    if (!response.ok) {
      setAuthError(payload.message ?? "Login failed.");
      setAuthLoading(false);
      return;
    }

    setSessionEmail(payload.email ?? null);
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setSessionEmail(null);
  };

  const handleDraftChange = (slug: string, next: Partial<RowDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        ...next,
      },
    }));
  };

  const handleSave = async (slug: string) => {
    const draft = drafts[slug];
    if (!draft) return;

    const freeLimit = Number(draft.free_monthly_limit);
    if (!Number.isFinite(freeLimit) || freeLimit < 0) {
      setError("Free monthly limit must be 0 or greater.");
      return;
    }

    setError(null);
    setMessage(null);

    const payload = {
      display_name: draft.display_name.trim(),
      free_monthly_limit: freeLimit,
      is_premium_only: draft.is_premium_only,
    };

    const response = await fetch("/api/admin/premium-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: { column: "feature_slug", value: slug },
        payload,
      }),
    });

    const result = (await response.json()) as { message?: string; data?: PremiumConfigRow };

    if (!response.ok) {
      setError(result.message ?? "Failed to update premium config.");
      return;
    }

    setRows((prev) =>
      prev.map((row) => (row.feature_slug === slug ? { ...row, ...payload } : row))
    );
    setMessage("Premium config updated.");
  };

  const handleCreate = async () => {
    if (!newDraft.feature_slug.trim() || !newDraft.display_name.trim()) {
      setError("Feature slug and display name are required.");
      return;
    }

    const freeLimit = Number(newDraft.free_monthly_limit);
    if (!Number.isFinite(freeLimit) || freeLimit < 0) {
      setError("Free monthly limit must be 0 or greater.");
      return;
    }

    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/premium-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature_slug: newDraft.feature_slug.trim(),
        display_name: newDraft.display_name.trim(),
        free_monthly_limit: freeLimit,
        is_premium_only: newDraft.is_premium_only,
      }),
    });

    const result = (await response.json()) as { message?: string; data?: PremiumConfigRow };

    if (!response.ok || !result.data) {
      setError(result.message ?? "Failed to create premium config.");
      return;
    }

    setRows((prev) => [result.data!, ...prev]);
    setDrafts((prev) => ({
      ...prev,
      [result.data!.feature_slug]: {
        display_name: result.data!.display_name,
        free_monthly_limit: String(result.data!.free_monthly_limit),
        is_premium_only: result.data!.is_premium_only,
      },
    }));
    setNewDraft({
      feature_slug: "",
      display_name: "",
      free_monthly_limit: "5",
      is_premium_only: false,
    });
    setMessage("Premium config created.");
  };

  return (
    <div className="nutra-admin min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            Nutra Kitchen Pass
          </p>
          <h1 className="display-type mt-2 text-4xl font-semibold sm:text-5xl">Premium Console</h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Manage premium feature limits and access rules.
          </p>
        </header>

        {statusMessage && (
          <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-5 text-amber-100">
            {statusMessage}
          </div>
        )}

        {!sessionEmail ? (
          <div className="grid gap-6">
            <form
              onSubmit={handleSignIn}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
            >
              <h2 className="text-2xl font-semibold text-white">Admin Login</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Use your Supabase admin credentials.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </label>
                {authError && (
                  <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={authLoading || !configured}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
                >
                  {authLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <AdminNav sessionEmail={sessionEmail} onSignOut={handleSignOut} />

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Config Table</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Update display names, free limits, and premium-only flags.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchRows}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
                >
                  Refresh
                </button>
              </div>

              {message && (
                <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </p>
              )}
              {error && (
                <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </p>
              )}
              {loading && <p className="mt-4 text-sm text-zinc-400">Loading...</p>}
              {!loading && rows.length === 0 && (
                <p className="mt-4 text-sm text-zinc-500">No premium_config rows found.</p>
              )}

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <h3 className="text-sm font-semibold text-white">Add New Feature</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1.2fr_0.6fr_auto]">
                  <input
                    type="text"
                    value={newDraft.feature_slug}
                    onChange={(event) =>
                      setNewDraft((prev) => ({ ...prev, feature_slug: event.target.value }))
                    }
                    placeholder="feature_slug"
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newDraft.display_name}
                    onChange={(event) =>
                      setNewDraft((prev) => ({ ...prev, display_name: event.target.value }))
                    }
                    placeholder="Display Name"
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={newDraft.free_monthly_limit}
                    onChange={(event) =>
                      setNewDraft((prev) => ({
                        ...prev,
                        free_monthly_limit: event.target.value,
                      }))
                    }
                    placeholder="Free limit"
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={newDraft.is_premium_only}
                        onChange={(event) =>
                          setNewDraft((prev) => ({
                            ...prev,
                            is_premium_only: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                      />
                      Premium
                    </label>
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="rounded-full border border-emerald-400/60 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
                <div className="max-h-[520px] overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-zinc-900/90 text-xs uppercase text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Feature Slug</th>
                        <th className="px-4 py-3 font-semibold">Display Name</th>
                        <th className="px-4 py-3 font-semibold">Free Limit</th>
                        <th className="px-4 py-3 font-semibold">Premium Only</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {rows.map((row) => {
                        const draft = drafts[row.feature_slug];
                        return (
                          <tr key={row.feature_slug}>
                            <td className="px-4 py-3 text-zinc-200">{row.feature_slug}</td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={draft?.display_name ?? row.display_name}
                                onChange={(event) =>
                                  handleDraftChange(row.feature_slug, {
                                    display_name: event.target.value,
                                  })
                                }
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={0}
                                value={draft?.free_monthly_limit ?? row.free_monthly_limit}
                                onChange={(event) =>
                                  handleDraftChange(row.feature_slug, {
                                    free_monthly_limit: event.target.value,
                                  })
                                }
                                className="w-24 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <label className="flex items-center gap-2 text-xs text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={draft?.is_premium_only ?? row.is_premium_only}
                                  onChange={(event) =>
                                    handleDraftChange(row.feature_slug, {
                                      is_premium_only: event.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-emerald-400"
                                />
                                Premium
                              </label>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleSave(row.feature_slug)}
                                className="rounded-full border border-emerald-400/60 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                              >
                                Save
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
