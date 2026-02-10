import { isConfigured, requireAdmin } from "../../api/admin/_supabase";
import PremiumConfigClient from "./PremiumConfigClient";

export default async function PremiumConfigPage() {
  const configured = isConfigured();
  const sessionData = await requireAdmin();
  const sessionEmail = sessionData?.user.email ?? null;

  return (
    <PremiumConfigClient
      initialSessionEmail={sessionEmail}
      initialConfigured={configured}
    />
  );
}
