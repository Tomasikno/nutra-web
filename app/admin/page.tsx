"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabaseClient";

const emptyRecipe = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: "",
  isPremium: false,
};

type Identifier = {
  column: string;
  value: string | number;
};

const getIdentifier = (row: Record<string, unknown>): Identifier | null => {
  if ("id" in row) {
    return { column: "id", value: row.id as string | number };
  }
  if ("key" in row) {
    return { column: "key", value: row.key as string | number };
  }
  if ("name" in row) {
    return { column: "name", value: row.name as string | number };
  }
  return null;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [recipe, setRecipe] = useState(emptyRecipe);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<string | null>(null);

  const [configRows, setConfigRows] = useState<Record<string, unknown>[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configDrafts, setConfigDrafts] = useState<Record<string, string>>({});

  const configured = useMemo(() => isSupabaseConfigured, []);

  useEffect(() => {
    const session = supabaseClient.getSession();
    setSessionEmail(session?.user.email ?? null);

    const unsubscribe = supabaseClient.onAuthStateChange((currentSession) => {
      setSessionEmail(currentSession?.user.email ?? null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;

    const fetchConfig = async () => {
      setConfigLoading(true);
      setConfigError(null);
      const { data, error } = await supabaseClient.select<Record<string, unknown>>(
        "premium_config"
      );

      if (error) {
        setConfigError(error.message);
        setConfigLoading(false);
        return;
      }

      const rows = data ?? [];
      setConfigRows(rows);
      const draftEntries = rows.reduce<Record<string, string>>((acc, row) => {
        const identifier = getIdentifier(row);
        if (!identifier) return acc;
        acc[String(identifier.value)] = JSON.stringify(row, null, 2);
        return acc;
      }, {});
      setConfigDrafts(draftEntries);
      setConfigLoading(false);
    };

    fetchConfig();
  }, [sessionEmail]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const { error } = await supabaseClient.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }

    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabaseClient.signOut();
  };

  const handleRecipeChange = (field: keyof typeof emptyRecipe, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: field === "isPremium" ? value === "true" : value,
    }));
  };

  const handleCreateRecipe = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecipeLoading(true);
    setRecipeMessage(null);

    const { error } = await supabaseClient.insert("recipes", [
      {
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image_url: recipe.imageUrl,
        is_premium: recipe.isPremium,
      },
    ]);

    if (error) {
      setRecipeMessage(error.message);
      setRecipeLoading(false);
      return;
    }

    setRecipeMessage("Recipe created successfully.");
    setRecipeLoading(false);
    setRecipe(emptyRecipe);
  };

  const handleConfigDraftChange = (key: string, value: string) => {
    setConfigDrafts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = async (row: Record<string, unknown>) => {
    const identifier = getIdentifier(row);
    if (!identifier) {
      setConfigError("Unable to determine identifier for this row.");
      return;
    }

    const draft = configDrafts[String(identifier.value)];
    if (!draft) return;

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(draft) as Record<string, unknown>;
    } catch (error) {
      setConfigError("Config JSON is invalid.");
      return;
    }

    if (identifier.column in payload) {
      delete payload[identifier.column];
    }

    const { error } = await supabaseClient.update(
      "premium_config",
      payload,
      identifier
    );

    if (error) {
      setConfigError(error.message);
      return;
    }

    setConfigError(null);
    setConfigRows((prev) =>
      prev.map((item) => {
        const itemId = getIdentifier(item);
        if (itemId?.column === identifier.column && itemId.value === identifier.value) {
          return { ...item, ...payload };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Nutra Admin
          </p>
          <h1 className="text-4xl font-semibold">Admin Console</h1>
          <p className="max-w-2xl text-zinc-300">
            Sign in with your Supabase admin credentials to create new recipes
            and update premium configuration settings.
          </p>
        </header>

        {!configured && (
          <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-5 text-amber-100">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
            your environment to enable admin actions.
          </div>
        )}

        {!sessionEmail ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
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
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
              <h3 className="text-xl font-semibold text-white">Quick Tips</h3>
              <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-sm text-zinc-300">
                <li>Ensure the admin account has access to recipes.</li>
                <li>Premium configuration updates are saved row by row.</li>
                <li>Keep your Supabase keys in environment variables.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
              <div>
                <p className="text-sm text-zinc-400">Signed in as</p>
                <p className="text-base font-semibold text-white">
                  {sessionEmail}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
              >
                Sign Out
              </button>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <form
                onSubmit={handleCreateRecipe}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
              >
                <h2 className="text-2xl font-semibold text-white">
                  Create Recipe
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add a new recipe to the Supabase recipes table.
                </p>
                <div className="mt-6 grid gap-4">
                  <label className="flex flex-col gap-2 text-sm">
                    Name
                    <input
                      type="text"
                      value={recipe.name}
                      onChange={(event) =>
                        handleRecipeChange("name", event.target.value)
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Description
                    <textarea
                      value={recipe.description}
                      onChange={(event) =>
                        handleRecipeChange("description", event.target.value)
                      }
                      className="min-h-[90px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Ingredients
                    <textarea
                      value={recipe.ingredients}
                      onChange={(event) =>
                        handleRecipeChange("ingredients", event.target.value)
                      }
                      className="min-h-[90px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      placeholder="List ingredients separated by commas or new lines"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Instructions
                    <textarea
                      value={recipe.instructions}
                      onChange={(event) =>
                        handleRecipeChange("instructions", event.target.value)
                      }
                      className="min-h-[90px] rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Image URL
                    <input
                      type="url"
                      value={recipe.imageUrl}
                      onChange={(event) =>
                        handleRecipeChange("imageUrl", event.target.value)
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    Premium Recipe
                    <select
                      value={recipe.isPremium ? "true" : "false"}
                      onChange={(event) =>
                        handleRecipeChange("isPremium", event.target.value)
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </label>
                </div>
                {recipeMessage && (
                  <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {recipeMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={recipeLoading}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
                >
                  {recipeLoading ? "Saving..." : "Create Recipe"}
                </button>
              </form>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
                <h2 className="text-2xl font-semibold text-white">
                  Premium Config
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Update configuration rows stored in premium_config.
                </p>
                <div className="mt-6 flex flex-col gap-4">
                  {configLoading && (
                    <p className="text-sm text-zinc-400">Loading...</p>
                  )}
                  {configError && (
                    <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {configError}
                    </p>
                  )}
                  {!configLoading && configRows.length === 0 && (
                    <p className="text-sm text-zinc-500">
                      No premium_config rows found.
                    </p>
                  )}
                  {configRows.map((row) => {
                    const identifier = getIdentifier(row);
                    if (!identifier) {
                      return null;
                    }
                    const key = String(identifier.value);
                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-emerald-200">
                            {identifier.column}: {key}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSaveConfig(row)}
                            className="rounded-full border border-emerald-400/60 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300 hover:text-white"
                          >
                            Save
                          </button>
                        </div>
                        <textarea
                          value={configDrafts[key] ?? ""}
                          onChange={(event) =>
                            handleConfigDraftChange(key, event.target.value)
                          }
                          className="mt-3 min-h-[140px] w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
