import { isConfigured, requireAdmin } from "../api/admin/_supabase";
import AdminPageClient from "./AdminPageClient";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const configured = isConfigured();
  const sessionData = await requireAdmin();
  const sessionEmail = sessionData?.user.email ?? null;

  return (
    <AdminPageClient
      initialSessionEmail={sessionEmail}
      initialConfigured={configured}
    />
  );
}
