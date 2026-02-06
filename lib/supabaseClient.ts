type SupabaseUser = {
  email: string | null;
};

type SupabaseSession = {
  accessToken: string;
  refreshToken: string;
  user: SupabaseUser;
};

type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const storageKey = "nutra.supabase.session";

const parseSession = (raw: string | null): SupabaseSession | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SupabaseSession;
    if (!data?.accessToken) return null;
    return data;
  } catch {
    return null;
  }
};

const getStoredSession = (): SupabaseSession | null => {
  if (typeof window === "undefined") return null;
  return parseSession(window.localStorage.getItem(storageKey));
};

const setStoredSession = (session: SupabaseSession | null) => {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(storageKey);
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(session));
};

const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<SupabaseResponse<T>> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: { message: "Supabase is not configured." } };
  }

  const response = await fetch(`${supabaseUrl}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    return {
      data: null,
      error: { message: message || response.statusText },
    };
  }

  const data = (await response.json()) as T;
  return { data, error: null };
};

const listeners = new Set<(session: SupabaseSession | null) => void>();

const notifyListeners = (session: SupabaseSession | null) => {
  listeners.forEach((listener) => listener(session));
};

export const supabaseClient = {
  async signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<SupabaseResponse<SupabaseSession>> {
    const { data, error } = await request<{
      access_token: string;
      refresh_token: string;
      user: { email: string | null };
    }>("/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (error || !data) {
      return { data: null, error: error ?? { message: "Login failed." } };
    }

    const session: SupabaseSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: { email: data.user?.email ?? null },
    };

    setStoredSession(session);
    notifyListeners(session);
    return { data: session, error: null };
  },
  async signOut(): Promise<void> {
    setStoredSession(null);
    notifyListeners(null);
  },
  getSession(): SupabaseSession | null {
    return getStoredSession();
  },
  onAuthStateChange(listener: (session: SupabaseSession | null) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async select<T>(table: string): Promise<SupabaseResponse<T[]>> {
    const session = getStoredSession();
    return request<T[]>(`/rest/v1/${table}?select=*`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session?.accessToken ?? supabaseAnonKey}`,
      },
    });
  },
  async insert<T>(table: string, rows: T[]): Promise<SupabaseResponse<T[]>> {
    const session = getStoredSession();
    return request<T[]>(`/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session?.accessToken ?? supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(rows),
    });
  },
  async update<T>(
    table: string,
    payload: Partial<T>,
    filter: { column: string; value: string | number }
  ): Promise<SupabaseResponse<T[]>> {
    const session = getStoredSession();
    const value = encodeURIComponent(String(filter.value));
    return request<T[]>(`/rest/v1/${table}?${filter.column}=eq.${value}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${session?.accessToken ?? supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
  },
};

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export type { SupabaseSession };
