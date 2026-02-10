import { defaultLocale } from "@/i18n/request";
import { redirect } from "next/navigation";

export default function PrivacyPolicyLegacyRoute() {
  redirect(`/${defaultLocale}/privacy-policy`);
}
