import { cookies } from "next/headers";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const sessionCookieName = "nutra-admin-session";

type AdminSession = {
  accessToken: string;
  email: string | null;
};

type AdminUser = {
  id: string;
  email: string | null;
};

const adminUserIds = new Set(
  (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

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
  return isSupabaseConfigured();
};

const getSession = async (): Promise<AdminSession | null> => {
  const store = await cookies();
  return parseSession(store.get(sessionCookieName)?.value);
};

const isAdminUser = (user: AdminUser | null) => {
  if (!user?.id) return false;
  if (adminUserIds.size === 0) return false;
  return adminUserIds.has(user.id);
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
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(session.accessToken);

  if (error || !data.user) {
    return null;
  }

  return { id: data.user.id, email: data.user.email ?? null };
};

const requireSession = async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserFromSession(session);
  if (!user) {
    // Don't clear session during rendering - let Server Actions handle it
    return null;
  }

  return { session, user };
};

const requireAdmin = async () => {
  const sessionData = await requireSession();
  if (!sessionData) return null;
  if (!isAdminUser(sessionData.user)) {
    // Don't clear session during rendering - let Server Actions handle it
    return null;
  }

  return sessionData;
};

export {
  clearSession,
  getSession,
  isAdminUser,
  isConfigured,
  requireAdmin,
  requireSession,
  setSession,
  sessionCookieName,
  supabaseAdmin,
};
export type { AdminSession, AdminUser };
