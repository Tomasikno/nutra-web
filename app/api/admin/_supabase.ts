import { cookies } from "next/headers";

const sessionCookieName = "nutra-admin-session";

type AdminSession = {
  accessToken: string;
  email: string | null;
};

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

const getConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  return { url, serviceRoleKey };
};

const parseSession = (raw: string | undefined): AdminSession | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as AdminSession;
    if (!data?.accessToken) return null;
    return data;
  } catch {
    return null;
  }
};

const isConfigured = () => {
  const { url, serviceRoleKey } = getConfig();
  return url.length > 0 && serviceRoleKey.length > 0;
};

const getSession = async (): Promise<AdminSession | null> => {
  const store = await cookies();
  return parseSession(store.get(sessionCookieName)?.value);
};

const setSession = async (session: AdminSession) => {
  const store = await cookies();
  store.set(sessionCookieName, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const clearSession = async () => {
  const store = await cookies();
  store.delete(sessionCookieName);
};

const getUserFromSession = async (session: AdminSession) => {
  const { url, serviceRoleKey } = getConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { email: string | null };
};

const requireSession = async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserFromSession(session);
  if (!user) {
    await clearSession();
    return null;
  }

  return { session, user };
};

const getServiceHeaders = () => {
  const { serviceRoleKey } = getConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
};

export {
  clearSession,
  getConfig,
  getServiceHeaders,
  getSession,
  isConfigured,
  requireSession,
  setSession,
  sessionCookieName,
};
export type { AdminSession };
