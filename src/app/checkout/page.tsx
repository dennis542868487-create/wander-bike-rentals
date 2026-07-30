import { permanentRedirect } from "next/navigation";

export default function LegacyCheckoutPage() {
  permanentRedirect("/bikes");
}
