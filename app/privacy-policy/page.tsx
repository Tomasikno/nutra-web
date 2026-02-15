import { defaultLocale } from "@/i18n/request";
import { permanentRedirect } from "next/navigation";

export default function PrivacyPolicyLegacyRoute() {
  permanentRedirect(`/${defaultLocale}/privacy-policy`);
}
