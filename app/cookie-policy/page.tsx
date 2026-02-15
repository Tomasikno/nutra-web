import { defaultLocale } from "@/i18n/request";
import { permanentRedirect } from "next/navigation";

export default function CookiePolicyLegacyRoute() {
  permanentRedirect(`/${defaultLocale}/cookie-policy`);
}
