import { permanentRedirect } from "next/navigation";

export default function LegacyOrderPage() {
  permanentRedirect("/account/requests");
}
