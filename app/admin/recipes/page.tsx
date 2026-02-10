import { isConfigured, requireAdmin } from "../../api/admin/_supabase";
import AdminRecipesClient from "./AdminRecipesClient";

export default async function AdminRecipesPage() {
  const configured = isConfigured();
  const sessionData = await requireAdmin();
  const sessionEmail = sessionData?.user.email ?? null;

  return (
    <AdminRecipesClient
      initialSessionEmail={sessionEmail}
      initialConfigured={configured}
    />
  );
}
